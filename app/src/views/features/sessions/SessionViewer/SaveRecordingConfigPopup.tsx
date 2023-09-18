import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Checkbox, Radio, Row } from "antd";
import { DebugInfo, SessionSaveMode } from "./types";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import {
  compressEvents,
  downloadSession,
  getRecordingOptionsToSave,
  getSessionEventsToSave,
  getSessionRecordingOptions,
  prepareSessionToExport,
} from "./sessionEventsUtils";
import { getSessionRecordingMetaData, getSessionRecordingEvents } from "store/features/session-recording/selectors";
import { toast } from "utils/Toast";
import { getUserAuthDetails, getUserAttributes, getAppMode } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { saveRecording } from "backend/sessionRecording/saveRecording";
import PATHS from "config/constants/sub/paths";
import {
  trackDraftSessionSaveFailed,
  trackDraftSessionSaved,
} from "modules/analytics/events/features/sessionRecording";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getTestReportById, saveTestReport } from "components/features/rules/TestThisRule/helpers";
import { getSessionRecordingSharedLink } from "utils/PathUtils";
import { trackTestRuleSessionDraftSaved } from "modules/analytics/events/features/ruleEditor";

interface Props {
  onClose: (e?: React.MouseEvent) => void;
  setIsSaveSessionClicked?: (value: boolean) => void;
  testRuleDraftSession?: {
    draftSessionTabId: string;
    testReportId: string;
    closeModal: () => void;
    appliedRuleStatus: boolean;
  };
}

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;
const defaultDebugInfo: CheckboxValueType[] = [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS];

const SaveRecordingConfigPopup: React.FC<Props> = ({ onClose, setIsSaveSessionClicked, testRuleDraftSession }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tabId } = useParams();
  const { pathname } = useLocation();
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);
  const sessionEvents = useSelector(getSessionRecordingEvents);
  const appMode = useSelector(getAppMode);

  const [isSaving, setIsSaving] = useState(false);
  const [sessionSaveMode, setSessionSaveMode] = useState<SessionSaveMode>(SessionSaveMode.ONLINE);
  const [includedDebugInfo, setIncludedDebugInfo] = useState<CheckboxValueType[]>(defaultDebugInfo);
  const isDraftSession = pathname.includes("draft") || !!testRuleDraftSession;
  const isSessionLogOptionsAlreadySaved = tabId === "imported" || !isDraftSession;

  const savedSessionRecordingOptions = useMemo(() => getSessionRecordingOptions(sessionRecordingMetadata?.options), [
    sessionRecordingMetadata?.options,
  ]);

  const isIncludeNetworkLogsDisabled =
    isSessionLogOptionsAlreadySaved && !savedSessionRecordingOptions.includes(DebugInfo.INCLUDE_NETWORK_LOGS);
  const isIncludeConsoleLogsDisabled =
    isSessionLogOptionsAlreadySaved && !savedSessionRecordingOptions.includes(DebugInfo.INCLUDE_CONSOLE_LOGS);

  useEffect(() => {
    if (isSessionLogOptionsAlreadySaved) {
      setIncludedDebugInfo(savedSessionRecordingOptions);
    }
  }, [isSessionLogOptionsAlreadySaved, savedSessionRecordingOptions]);

  const trackSessionsCreatedCount = useCallback(
    (didCreateLocally = false) => {
      const numSessionsSavedOffline = userAttributes?.num_sessions_saved_offline || 0;
      const numSessionsSavedOnline = userAttributes?.num_sessions_saved_online || 0;

      if (didCreateLocally) {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_SESSIONS_SAVED_OFFLINE, numSessionsSavedOffline + 1);
      } else {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_SESSIONS_SAVED_ONLINE, numSessionsSavedOnline + 1);
      }
    },
    [userAttributes?.num_sessions_saved_online, userAttributes?.num_sessions_saved_offline]
  );

  const saveDraftSession = useCallback(
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

      if (isSaving) {
        return;
      }

      if (!sessionRecordingMetadata?.name) {
        toast.error("Name is required to save the recording.");
        return;
      }

      const recordingOptionsToSave = getRecordingOptionsToSave(includedDebugInfo);

      setIsSaving(true);
      setIsSaveSessionClicked?.(true);
      saveRecording(
        user?.details?.profile?.uid,
        workspace?.id,
        sessionRecordingMetadata,
        compressEvents(getSessionEventsToSave(sessionEvents, recordingOptionsToSave)),
        recordingOptionsToSave
      ).then((response) => {
        if (response?.success) {
          onClose();
          toast.success("Recording saved successfully");
          trackDraftSessionSaved(
            sessionRecordingMetadata?.sessionAttributes?.duration,
            recordingOptionsToSave,
            SessionSaveMode.ONLINE
          );
          testRuleDraftSession && trackTestRuleSessionDraftSaved(SessionSaveMode.ONLINE);
          trackSessionsCreatedCount();
          if (testRuleDraftSession) {
            getTestReportById(appMode, testRuleDraftSession.testReportId).then((testReport) => {
              if (testReport) {
                testReport.sessionLink = getSessionRecordingSharedLink(response?.firestoreId);
                saveTestReport(appMode, testRuleDraftSession.testReportId, testReport).then(
                  testRuleDraftSession.closeModal
                );
              }
            });
          } else {
            navigate(PATHS.SESSIONS.RELATIVE + "/saved/" + response?.firestoreId, {
              replace: true,
              state: { fromApp: true, viewAfterSave: true },
            });
          }
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
      isSaving,
      sessionRecordingMetadata,
      includedDebugInfo,
      setIsSaveSessionClicked,
      workspace?.id,
      sessionEvents,
      dispatch,
      onClose,
      trackSessionsCreatedCount,
      testRuleDraftSession,
      appMode,
      navigate,
    ]
  );

  const handleDownloadFileClick = useCallback(
    (e: React.MouseEvent) => {
      setIsSaving(true);
      const recordingOptionsToSave = getRecordingOptionsToSave(includedDebugInfo);
      const events = compressEvents(getSessionEventsToSave(sessionEvents, recordingOptionsToSave));
      const metadata = {
        name: sessionRecordingMetadata.name,
        options: { ...recordingOptionsToSave },
        sessionAttributes: { ...sessionRecordingMetadata.sessionAttributes },
      };

      prepareSessionToExport(events, metadata)
        .then((fileContent) => downloadSession(fileContent, sessionRecordingMetadata.name))
        .finally(() => {
          toast.success("Recording downloaded successfully.");
          onClose();
          setIsSaving(false);
          trackDraftSessionSaved(
            sessionRecordingMetadata.sessionAttributes?.duration,
            recordingOptionsToSave,
            SessionSaveMode.LOCAL
          );
          testRuleDraftSession && trackTestRuleSessionDraftSaved(SessionSaveMode.LOCAL);
          trackSessionsCreatedCount(true);
        });
    },
    [
      includedDebugInfo,
      sessionEvents,
      sessionRecordingMetadata.name,
      sessionRecordingMetadata.sessionAttributes,
      onClose,
      testRuleDraftSession,
      trackSessionsCreatedCount,
    ]
  );

  return (
    <div className="save-recording-config-popup">
      <Row align="middle" justify="space-between" className="w-full header-container">
        <div className="header">{isDraftSession ? "Save" : "Download"} your session replay</div>
        <Button onClick={onClose}>
          <CloseOutlined />
        </Button>
      </Row>
      <div className="config-container">
        {isDraftSession && (
          <div>
            <div className="config-label">Mode of saving the session</div>
            <Radio.Group
              value={sessionSaveMode}
              className="mode-radio-group"
              onChange={(e) => setSessionSaveMode(e.target.value)}
            >
              <Radio value={SessionSaveMode.ONLINE}>Save online</Radio>
              <Radio value={SessionSaveMode.LOCAL}>Download as a file</Radio>
            </Radio.Group>
          </div>
        )}

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
          onClick={
            isDraftSession && sessionSaveMode === SessionSaveMode.ONLINE ? saveDraftSession : handleDownloadFileClick
          }
        >
          {isDraftSession && sessionSaveMode === SessionSaveMode.ONLINE ? "Save" : "Download"}
        </Button>
      </Row>
    </div>
  );
};

export default SaveRecordingConfigPopup;
