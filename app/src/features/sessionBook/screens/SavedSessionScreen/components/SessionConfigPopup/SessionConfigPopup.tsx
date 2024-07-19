//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Checkbox, Radio, Row } from "antd";
import { DebugInfo, SessionSaveMode } from "../../../../types";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { getRecordingOptionsToSave, getSessionRecordingOptions } from "../../../../utils/sessionFile";
import { getSessionRecordingMetaData, getSessionRecordingEvents } from "store/features/session-recording/selectors";
import { toast } from "utils/Toast";
import { getUserAttributes, getAppMode, getUserAuthDetails } from "store/selectors";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { trackDraftSessionSaved } from "modules/analytics/events/features/sessionRecording";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { downloadSessionFile } from "features/sessionBook/utils/sessionFile";
import { useIncentiveActions } from "features/incentivization/hooks";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { SOURCE } from "modules/analytics/events/common/constants";
import Logger from "lib/logger";
import { saveDraftSession } from "features/sessionBook/screens/DraftSessionScreen/utils";
import "./sessionConfigPopup.scss";
import PATHS from "config/constants/sub/paths";

interface Props {
  onClose: (e?: React.MouseEvent) => void;
  onSaveClick?: () => void;
  source?: string;
}

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;
const defaultDebugInfo: CheckboxValueType[] = [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS];

export const SessionConfigPopup: React.FC<Props> = ({ onClose, onSaveClick, source = SOURCE.SAVE_DRAFT_SESSION }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tabId } = useParams();
  const { pathname } = useLocation();
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);
  const sessionEvents = useSelector(getSessionRecordingEvents);
  const appMode = useSelector(getAppMode);

  const { claimIncentiveRewards } = useIncentiveActions();

  const [isSaving, setIsSaving] = useState(false);
  const [sessionSaveMode, setSessionSaveMode] = useState<SessionSaveMode>(SessionSaveMode.ONLINE);
  const [includedDebugInfo, setIncludedDebugInfo] = useState<CheckboxValueType[]>(defaultDebugInfo);
  const isDraftSession = pathname.includes(PATHS.SESSIONS.INDEX) || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

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

  const handleSaveDraftSession = useCallback(
    (e: React.MouseEvent) => {
      if (!user?.loggedIn) {
        dispatch(
          // @ts-ignore
          actions.toggleActiveModal({
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
      onSaveClick?.();
      saveDraftSession(
        user,
        userAttributes,
        appMode,
        dispatch,
        navigate,
        workspace?.id,
        sessionRecordingMetadata,
        sessionEvents,
        includedDebugInfo,
        source,
        claimIncentiveRewards
      )
        .then(() => {
          onClose?.();
        })
        .catch((err: unknown) => {
          Logger.log("Failed to save draft session", err);
        })
        .finally(() => {
          setIsSaving(false);
        });
    },
    [
      isSaving,
      sessionRecordingMetadata,
      includedDebugInfo,
      onSaveClick,
      workspace?.id,
      sessionEvents,
      dispatch,
      appMode,
      navigate,
      user,
      source,
      userAttributes,
      onClose,
      claimIncentiveRewards,
    ]
  );

  const handleDownloadFileClick = useCallback(
    (e: React.MouseEvent) => {
      setIsSaving(true);
      const recordingOptionsToSave = getRecordingOptionsToSave(includedDebugInfo);
      downloadSessionFile(sessionEvents, sessionRecordingMetadata, recordingOptionsToSave).then(() => {
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
        trackSessionsCreatedCount(true);
      });
    },
    [sessionEvents, sessionRecordingMetadata, includedDebugInfo, onClose, trackSessionsCreatedCount, source]
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
