import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
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
import { getUserAttributes, getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { trackDraftSessionSaved } from "modules/analytics/events/features/sessionRecording";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { trackTestRuleSessionDraftSaved } from "modules/analytics/events/features/ruleEditor";
import { DraftSessionViewerProps } from "./DraftSessionViewer";
import { saveDraftSession } from "features/sessionBook/screens/DraftSessionScreen/utils";
import { LOGGER as Logger } from "@requestly/utils";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface Props {
  onClose: (e?: React.MouseEvent) => void;
  setIsSaveSessionClicked?: (value: boolean) => void;
  testRuleDraftSession?: DraftSessionViewerProps["testRuleDraftSession"];
  source?: string;
}

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;
const defaultDebugInfo: CheckboxValueType[] = [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS];

const SaveRecordingConfigPopup: React.FC<Props> = ({
  onClose,
  setIsSaveSessionClicked,
  testRuleDraftSession,
  source,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tabId } = useParams();
  const { pathname } = useLocation();
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);
  const sessionEvents = useSelector(getSessionRecordingEvents);
  const appMode = useSelector(getAppMode);

  const [isSaving, setIsSaving] = useState(false);
  const [sessionSaveMode, setSessionSaveMode] = useState<SessionSaveMode>(SessionSaveMode.ONLINE);
  const [includedDebugInfo, setIncludedDebugInfo] = useState<CheckboxValueType[]>(defaultDebugInfo);
  const isDraftSession =
    pathname.includes("draft") || !!testRuleDraftSession || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;
  const isSessionLogOptionsAlreadySaved =
    tabId === "imported" || !isDraftSession || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

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

  // CURRENTLY THIS FUNCTION IS REDUNDANT, USED BY DRAFT SESSION VIEWER AND SAVE POPUP
  // TODO: REFACTOR THIS WHEN REVAMP TASK IS PICKED
  const handleSaveDraftSession = useCallback(
    (e: React.MouseEvent) => {
      if (!user?.loggedIn) {
        dispatch(
          globalActions.toggleActiveModal({
            modalName: "authModal",
            newValue: true,
            newProps: {
              authMode: AUTH_ACTION_LABELS.SIGN_UP,
              src: window.location.href,
              eventSource: SOURCE.SAVE_DRAFT_SESSION,
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

      setIsSaving(true);
      setIsSaveSessionClicked?.(true);
      saveDraftSession(
        user,
        userAttributes,
        appMode,
        dispatch,
        navigate,
        activeWorkspaceId,
        sessionRecordingMetadata,
        sessionEvents,
        includedDebugInfo,
        source
      )
        .then(() => {
          onClose?.();
        })
        .catch((err) => {
          Logger.log("Failed to save draft session", err);
        })
        .finally(() => {
          setIsSaving(false);
        });
    },
    [
      user,
      isSaving,
      sessionRecordingMetadata,
      includedDebugInfo,
      setIsSaveSessionClicked,
      activeWorkspaceId,
      sessionEvents,
      dispatch,
      appMode,
      navigate,
      source,
      userAttributes,
      onClose,
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
        recordingMode: sessionRecordingMetadata?.recordingMode || null,
      };

      prepareSessionToExport(events, metadata)
        .then((fileContent) => downloadSession(fileContent, sessionRecordingMetadata.name))
        .finally(() => {
          toast.success("Recording downloaded successfully.");
          onClose();
          setIsSaving(false);
          trackDraftSessionSaved({
            session_length: sessionRecordingMetadata?.sessionAttributes?.duration,
            options: recordingOptionsToSave,
            type: SessionSaveMode.LOCAL,
            source,
            recording_mode: sessionRecordingMetadata?.recordingMode,
          });
          testRuleDraftSession && trackTestRuleSessionDraftSaved(SessionSaveMode.LOCAL);
          trackSessionsCreatedCount(true);
        });
    },
    [
      sessionEvents,
      sessionRecordingMetadata,
      includedDebugInfo,
      onClose,
      trackSessionsCreatedCount,
      testRuleDraftSession,
      source,
    ]
  );

  return (
    <div className="save-recording-config-popup">
      <Row align="middle" justify="space-between" className="w-full header-container">
        <div className="header">{isDraftSession ? "Save" : "Download"} your session</div>
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
            isDraftSession && sessionSaveMode === SessionSaveMode.ONLINE
              ? handleSaveDraftSession
              : handleDownloadFileClick
          }
        >
          {isDraftSession && sessionSaveMode === SessionSaveMode.ONLINE ? "Save" : "Download"}
        </Button>
      </Row>
    </div>
  );
};

export default SaveRecordingConfigPopup;
