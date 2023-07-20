import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTabSession } from "actions/ExtensionActions";
import { Button, Checkbox, Modal, Radio, RadioChangeEvent, Row } from "antd";
import { CloseOutlined, DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { useNavigate, useParams } from "react-router-dom";
import SessionDetails from "./SessionDetails";
import { SessionViewerTitle } from "./SessionViewerTitle";
import { RQSession, RQSessionEvents, RQSessionEventType, RRWebEventData } from "@requestly/web-sdk";
import PATHS from "config/constants/sub/paths";
import { toast } from "utils/Toast";
import mockSession from "./mockData/mockSession";
import {
  compressEvents,
  downloadSession,
  filterOutConsoleLogs,
  filterOutLargeNetworkResponses,
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
import { RecordingOptions } from "./types";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import {
  trackDraftSessionDiscarded,
  trackDraftSessionSaved,
  trackDraftSessionSaveFailed,
  trackDraftSessionViewed,
  trackSessionRecordingFailed,
} from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";

enum SessionSaveMode {
  LOCAL = "local",
  ONLINE = "online",
}

enum DebugInfo {
  INCLUDE_NETWORK_LOGS = "includeNetworkLogs",
  INCLUDE_CONSOLE_LOGS = "includeConsoleLogs",
}

const defaultDebugInfo: CheckboxValueType[] = [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS];

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
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [includedDebugInfo, setIncludedDebugInfo] = useState<CheckboxValueType[]>(defaultDebugInfo);
  const [sessionSaveMode, setSessionSaveMode] = useState<SessionSaveMode>(SessionSaveMode.ONLINE);

  const importedSessionRecordingOptions = useMemo(
    () => Object.keys(sessionRecording?.options ?? {}).filter((key: DebugInfo) => sessionRecording?.options?.[key]),
    [sessionRecording?.options]
  );

  const isIncludeNetworkLogsDisabled =
    isImportedSession && !importedSessionRecordingOptions.includes(DebugInfo.INCLUDE_NETWORK_LOGS);
  const isIncludeConsoleLogsDisabled =
    isImportedSession && !importedSessionRecordingOptions.includes(DebugInfo.INCLUDE_CONSOLE_LOGS);

  console.log({ sessionRecording, sessionEvents, sessionSaveMode });

  const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

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

  const getSessionEventsToSave = useCallback(
    (options: RecordingOptions): RQSessionEvents => {
      const filteredSessionEvents: RQSessionEvents = {
        [RQSessionEventType.RRWEB]: sessionEvents[RQSessionEventType.RRWEB],
        [RQSessionEventType.NETWORK]: sessionEvents[RQSessionEventType.NETWORK],
      };

      if (options.includeNetworkLogs === false) {
        delete filteredSessionEvents[RQSessionEventType.NETWORK];
      }

      if (options.includeConsoleLogs === false) {
        const filteredRRWebEvent = filterOutConsoleLogs(sessionEvents[RQSessionEventType.RRWEB] as RRWebEventData[]);
        filteredSessionEvents[RQSessionEventType.RRWEB] = filteredRRWebEvent;
      }

      return filteredSessionEvents;
    },
    [sessionEvents]
  );

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

  const handleDownloadLocalClick = (e: React.MouseEvent) => {
    const recordingOptionsToSave = getRecordingOptionsToSave();
    const sessionEvents = compressEvents(getSessionEventsToSave(recordingOptionsToSave));
    prepareSessionToExport(sessionEvents, { ...sessionRecording, options: recordingOptionsToSave })
      .then((fileContent) => downloadSession(fileContent, sessionRecording.name))
      .finally(() => {
        toast.success("Recording downloaded successfully");
        setSessionSaveMode(SessionSaveMode.ONLINE);
        setIsSaveModalVisible(false);
        trackDraftSessionSaved(
          sessionRecording.sessionAttributes.duration,
          recordingOptionsToSave,
          SessionSaveMode.LOCAL
        );
      });
  };

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
        compressEvents(getSessionEventsToSave(recordingOptionsToSave)),
        recordingOptionsToSave
      ).then((response) => {
        if (response?.success) {
          setSessionSaveMode(SessionSaveMode.ONLINE);
          setIsSaveModalVisible(false);
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
      sessionRecording,
      sessionRecordingName,
      sessionAttributes,
      dispatch,
      AUTH_ACTION_LABELS.SIGN_UP,
      navigate,
      getSessionEventsToSave,
      getRecordingOptionsToSave,
    ]
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
            className="text-bold session-viewer-save-action-btn"
            type="primary"
            onClick={() => setIsSaveModalVisible((prev) => !prev)}
          >
            Save Recording <DownOutlined />
          </RQButton>

          {isSaveModalVisible && (
            <div className="save-recording-config-modal">
              <Row align="middle" justify="space-between" className="w-full header-container">
                <div className="header">Save your session recording</div>
                <Button onClick={() => setIsSaveModalVisible(false)}>
                  <CloseOutlined />
                </Button>
              </Row>
              <div className="config-container">
                <div>
                  <div className="config-label">Mode of saving the session</div>
                  <Radio.Group
                    value={sessionSaveMode}
                    onChange={handleSessionSaveModeChange}
                    className="mode-radio-group"
                  >
                    <Radio value={SessionSaveMode.ONLINE}>Save online</Radio>
                    <Radio value={SessionSaveMode.LOCAL}>Download JSON file</Radio>
                  </Radio.Group>
                </div>
                <div>
                  <div className="config-label">Information to include in session</div>
                  <Checkbox.Group
                    onChange={setIncludedDebugInfo}
                    value={includedDebugInfo}
                    options={[
                      {
                        label: "Network Logs",
                        value: "includeNetworkLogs",
                        disabled: isIncludeNetworkLogsDisabled,
                      },
                      {
                        label: "Console Logs",
                        value: "includeConsoleLogs",
                        disabled: isIncludeConsoleLogsDisabled,
                      },
                    ]}
                  />
                </div>
              </div>
              <Row className="w-full footer">
                <Button
                  type="primary"
                  className="ml-auto"
                  loading={isSaving}
                  onClick={sessionSaveMode === SessionSaveMode.ONLINE ? saveDraftSession : handleDownloadLocalClick}
                >
                  {sessionSaveMode === SessionSaveMode.ONLINE ? "Save" : "Download"}
                </Button>
              </Row>
            </div>
          )}
        </div>
      </div>
      <SessionDetails key={tabId} />
    </div>
  );
};

export default DraftSessionViewer;
