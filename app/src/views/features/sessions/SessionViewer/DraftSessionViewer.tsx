import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTabSession } from "actions/ExtensionActions";
import { Modal, RadioChangeEvent } from "antd";
import { DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { useNavigate, useParams } from "react-router-dom";
import SessionDetails from "./SessionDetails";
import { SessionViewerTitle } from "./SessionViewerTitle";
import { RQSession } from "@requestly/web-sdk";
import PATHS from "config/constants/sub/paths";
import { toast } from "utils/Toast";
import mockSession from "./mockData/mockSession";
import {
  compressEvents,
  downloadSession,
  filterOutLargeNetworkResponses,
  getSessionEventsToSave,
  getSessionRecordingOptions,
  prepareSessionToExport,
} from "./sessionEventsUtils";
import PageLoader from "components/misc/PageLoader";
import { getUserAuthDetails } from "store/selectors";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import {
  getSessionRecording,
  getSessionRecordingAttributes,
  getSessionRecordingEvents,
  getSessionRecordingName,
} from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import PageError from "components/misc/PageError";
import { saveRecording } from "backend/sessionRecording/saveRecording";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { DebugInfo, RecordingOptions, SessionSaveMode } from "./types";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import SaveRecordingConfigPopup from "./SaveRecordingConfigPopup";
import { defaultDebugInfo } from "./constants";
import {
  trackDraftSessionDiscarded,
  trackDraftSessionSaved,
  trackDraftSessionSaveFailed,
  trackDraftSessionViewed,
  trackSessionRecordingFailed,
} from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

const DraftSessionViewer: React.FC = () => {
  const { tabId } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const sessionRecording = useSelector(getSessionRecording);
  const sessionEvents = useSelector(getSessionRecordingEvents);
  const sessionAttributes = useSelector(getSessionRecordingAttributes);
  const sessionRecordingName = useSelector(getSessionRecordingName);

  const isImportedSession = tabId === "imported";
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string>();
  const [isSavePopupVisible, setIsSavePopupVisible] = useState(false);
  const [includedDebugInfo, setIncludedDebugInfo] = useState<CheckboxValueType[]>(defaultDebugInfo);
  const [sessionSaveMode, setSessionSaveMode] = useState<SessionSaveMode>(SessionSaveMode.ONLINE);

  const importedSessionRecordingOptions = useMemo(() => getSessionRecordingOptions(sessionRecording?.options), [
    sessionRecording?.options,
  ]);

  const isIncludeNetworkLogsDisabled =
    isImportedSession && !importedSessionRecordingOptions.includes(DebugInfo.INCLUDE_NETWORK_LOGS);
  const isIncludeConsoleLogsDisabled =
    isImportedSession && !importedSessionRecordingOptions.includes(DebugInfo.INCLUDE_CONSOLE_LOGS);

  const generateDraftSessionTitle = useCallback((url: string) => {
    const hostname = new URL(url).hostname.split(".").slice(0, -1).join(".");
    const date = new Date();
    const month = date.toLocaleString("default", { month: "short" });
    const formattedDate = `${date.getDate()}${month}${date.getFullYear()}`;
    return `${hostname}@${formattedDate}`;
  }, []);

  useEffect(
    () => () => {
      dispatch(sessionRecordingActions.resetState());
    },
    [dispatch]
  );

  // useEffect(
  //   () => () => {
  //     if (isImportedSession && sessionRecording === null) {
  //       console.log("navigating...");
  //       navigate(PATHS.SESSIONS.ABSOLUTE);
  //     }
  //   },
  //   [navigate, isImportedSession, sessionRecording]
  // );

  useEffect(() => {
    trackDraftSessionViewed();

    setIsLoading(true);

    if (tabId === "imported") {
      console.log("running...");
      setIncludedDebugInfo(importedSessionRecordingOptions);
      setIsLoading(false);
    } else if (tabId === "mock") {
      // TODO: remove mock flow
      dispatch(
        sessionRecordingActions.setSessionRecording({
          sessionAttributes: mockSession.attributes,
          name: "Mock Session Recording",
        })
      );
      dispatch(sessionRecordingActions.setEvents(mockSession.events));
      setIsLoading(false);
    } else {
      getTabSession(parseInt(tabId)).then((payload: unknown) => {
        if (typeof payload === "string") {
          setLoadingError(payload);
        } else {
          const tabSession = payload as RQSession;

          if (tabSession.events.rrweb?.length < 2) {
            setLoadingError("RRWeb events not captured");
          } else {
            dispatch(
              sessionRecordingActions.setSessionRecording({
                sessionAttributes: tabSession.attributes,
                name: generateDraftSessionTitle(tabSession.attributes?.url),
              })
            );

            filterOutLargeNetworkResponses(tabSession.events);
            dispatch(sessionRecordingActions.setEvents(tabSession.events));
          }
        }
        setIsLoading(false);
      });
    }
  }, [dispatch, tabId, user?.details?.profile?.email, generateDraftSessionTitle, importedSessionRecordingOptions]);

  const getRecordingOptionsToSave = useCallback((): RecordingOptions => {
    const recordingOptions: RecordingOptions = {
      includeConsoleLogs: true,
      includeNetworkLogs: true,
    };
    let option: keyof RecordingOptions;
    for (option in recordingOptions) {
      recordingOptions[option] = includedDebugInfo.includes(option);
    }

    return recordingOptions;
  }, [includedDebugInfo]);

  const saveDraftSession = useCallback(
    (e: React.MouseEvent) => {
      if (!user?.loggedIn) {
        // Prompt to login
        dispatch(
          actions.toggleActiveModal({
            modalName: "authModal",
            newValue: true,
            newProps: {
              // redirectURL: window.location.href,
              authMode: AUTH_ACTION_LABELS.SIGN_UP,
              src: window.location.href,
              eventSource: AUTH.SOURCE.SAVE_DRAFT_SESSION,
            },
          })
        );
        return;
      }
      if (isSaving) {
        return;
      }

      if (!sessionRecordingName) {
        toast.error("Name is required to save the recording.");
        return;
      }

      const recordingOptionsToSave = getRecordingOptionsToSave();

      setIsSaving(true);
      saveRecording(
        user?.details?.profile?.uid,
        workspace?.id,
        sessionRecording,
        compressEvents(getSessionEventsToSave(sessionEvents, recordingOptionsToSave)),
        recordingOptionsToSave
      ).then((response) => {
        if (response?.success) {
          setSessionSaveMode(SessionSaveMode.ONLINE);
          setIsSavePopupVisible(false);
          toast.success("Recording saved successfully");
          trackDraftSessionSaved(sessionAttributes.duration, recordingOptionsToSave, SessionSaveMode.ONLINE);
          navigate(PATHS.SESSIONS.RELATIVE + "/saved/" + response?.firestoreId, {
            replace: true,
            state: { fromApp: true, viewAfterSave: true },
          });
        } else {
          toast.error(response?.message);
          trackDraftSessionSaveFailed(response?.message);
          setIsSaving(false);
        }
      });
    },
    [
      user?.loggedIn,
      user?.details?.profile?.uid,
      workspace?.id,
      isSaving,
      sessionEvents,
      sessionRecording,
      sessionRecordingName,
      sessionAttributes,
      dispatch,
      navigate,
      getRecordingOptionsToSave,
    ]
  );

  const handleDownloadFileClick = useCallback(
    (e: React.MouseEvent) => {
      if (!user?.loggedIn) {
        dispatch(
          actions.toggleActiveModal({
            modalName: "authModal",
            newValue: true,
            newProps: {
              authMode: AUTH_ACTION_LABELS.SIGN_UP,
              src: window.location.href,
              eventSource: AUTH.SOURCE.SAVE_DRAFT_SESSION,
            },
          })
        );
        return;
      }

      setIsSaving(true);
      const recordingOptionsToSave = getRecordingOptionsToSave();
      const events = compressEvents(getSessionEventsToSave(sessionEvents, recordingOptionsToSave));

      prepareSessionToExport(events, { ...sessionRecording, options: recordingOptionsToSave })
        .then((fileContent) => downloadSession(fileContent, sessionRecording.name))
        .finally(() => {
          toast.success("Recording downloaded successfully.");
          setIsSaving(false);
          setSessionSaveMode(SessionSaveMode.ONLINE);
          setIsSavePopupVisible(false);
          trackDraftSessionSaved(
            sessionRecording.sessionAttributes.duration,
            recordingOptionsToSave,
            SessionSaveMode.LOCAL
          );
        });
    },
    [dispatch, user?.loggedIn, getRecordingOptionsToSave, sessionEvents, sessionRecording]
  );

  const confirmDiscard = () => {
    Modal.confirm({
      title: "Confirm Discard",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to discard this draft recording?",
      okText: "Yes",
      cancelText: "No",
      onOk() {
        trackDraftSessionDiscarded();
        navigate(PATHS.SESSIONS.ABSOLUTE);
      },
    });
  };

  useEffect(() => {
    if (loadingError) {
      trackSessionRecordingFailed(loadingError);
    }
  }, [loadingError]);

  const handleSessionSaveModeChange = (e: RadioChangeEvent) => {
    setSessionSaveMode(e.target.value);
  };

  return isLoading ? (
    <PageLoader message="Loading session details..." />
  ) : loadingError ? (
    <PageError error="Session Recording Loading Error" />
  ) : (
    <div className="session-viewer-page">
      <div className="session-viewer-header">
        <SessionViewerTitle />
        <div className="session-viewer-actions">
          <RQButton type="default" onClick={confirmDiscard}>
            Discard
          </RQButton>
          <RQButton
            type="primary"
            className="text-bold session-viewer-save-action-btn"
            onClick={() => setIsSavePopupVisible((prev) => !prev)}
          >
            Save Recording <DownOutlined />
          </RQButton>

          {isSavePopupVisible && (
            <SaveRecordingConfigPopup
              isSaving={isSaving}
              onClose={() => setIsSavePopupVisible(false)}
              includedDebugInfo={includedDebugInfo}
              setIncludedDebugInfo={setIncludedDebugInfo}
              sessionSaveMode={sessionSaveMode}
              saveDraftSession={saveDraftSession}
              handleDownloadFileClick={handleDownloadFileClick}
              handleSessionSaveModeChange={handleSessionSaveModeChange}
              isIncludeNetworkLogsDisabled={isIncludeNetworkLogsDisabled}
              isIncludeConsoleLogsDisabled={isIncludeConsoleLogsDisabled}
            />
          )}
        </div>
      </div>
      <SessionDetails key={tabId} />
    </div>
  );
};

export default DraftSessionViewer;
