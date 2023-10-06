import React, { useCallback, useEffect, useState } from "react";
import { Row, Tooltip } from "antd";
import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "../../../constants";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import SettingIcon from "../../../../resources/icons/setting.svg";
import PlayRecordingIcon from "../../../../resources/icons/playRecording.svg";
import StopRecordingIcon from "../../../../resources/icons/stopRecording.svg";
import ReplayLastFiveMinuteIcon from "../../../../resources/icons/replayLastFiveMinute.svg";
import ShieldIcon from "../../../../resources/icons/shield.svg";
import config from "../../../config";
import { EVENT, sendEvent } from "../../events";
import "./sessionRecordingView.css";

const SessionRecordingView: React.FC = () => {
  const [currentTabId, setCurrentTabId] = useState<number>();
  const [isRecordingSession, setIsRecordingSession] = useState<boolean>();
  const [isManualMode, setIsManualMode] = useState<boolean>();

  const startRecordingOnClick = useCallback(() => {
    sendEvent(EVENT.START_RECORDING_CLICKED);
    chrome.runtime.sendMessage({
      action: EXTENSION_MESSAGES.START_RECORDING_EXPLICITLY,
      tabId: currentTabId,
      showWidget: true,
    });
    setIsManualMode(true);
    setIsRecordingSession(true);
  }, [currentTabId]);

  const viewRecordingOnClick = useCallback(() => {
    if (isManualMode) {
      sendEvent(EVENT.STOP_RECORDING_CLICKED, { recording_mode: isManualMode ? "manual" : "automatic" });
      chrome.runtime.sendMessage({
        action: EXTENSION_MESSAGES.STOP_RECORDING,
        tabId: currentTabId,
        openRecording: true,
      });
      setIsRecordingSession(false);
    } else {
      sendEvent(EVENT.VIEW_RECORDING_CLICKED);
      chrome.runtime.sendMessage({
        action: EXTENSION_MESSAGES.WATCH_RECORDING,
        tabId: currentTabId,
      });
    }
  }, [isManualMode, currentTabId]);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, ([activeTab]) => {
      setCurrentTabId(activeTab.id);
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: CLIENT_MESSAGES.IS_RECORDING_SESSION },
        { frameId: 0 },
        setIsRecordingSession
      );
    });
  }, []);

  useEffect(() => {
    if (currentTabId) {
      chrome.tabs.sendMessage(
        currentTabId,
        {
          action: CLIENT_MESSAGES.IS_EXPLICIT_RECORDING_SESSION,
        },
        { frameId: 0 },
        setIsManualMode
      );
    }
  }, [currentTabId]);

  const isRecordingInManualMode = isRecordingSession && isManualMode;
  const isRecordingInAutoMode = isRecordingSession && !isManualMode;

  return (
    <div className="session-view-content">
      <Row align="middle" justify="space-between">
        <div className="title">Record session for debugging and sharing</div>
        <div
          className="configure-btn"
          onClick={() => {
            // TODO: send analytics
            window.open(`${config.WEB_URL}/sessions/settings?source=popup`, "_blank");
          }}
        >
          <SettingIcon /> Configure
        </div>
      </Row>
      <Row wrap={false} align="middle" className="action-btns">
        <Tooltip
          arrow={null}
          placement="top"
          title="Capture mouse movement, console, network, and more."
          overlayClassName="action-btn-tooltip"
        >
          <PrimaryActionButton
            block
            disabled={isRecordingInAutoMode}
            className={isRecordingInManualMode ? "stop-btn" : ""}
            icon={isRecordingInManualMode ? <StopRecordingIcon /> : <PlayRecordingIcon />}
            onClick={isRecordingInManualMode ? viewRecordingOnClick : startRecordingOnClick}
          >
            {isRecordingInManualMode ? "Stop and watch" : " Record this tab"}
          </PrimaryActionButton>
        </Tooltip>

        <Tooltip
          arrow={null}
          placement="top"
          title="Instantly play last 5 min auto recorded session for this tab."
          overlayClassName="action-btn-tooltip"
        >
          <PrimaryActionButton
            block
            icon={<ReplayLastFiveMinuteIcon />}
            disabled={isRecordingInManualMode || !isRecordingSession}
            onClick={viewRecordingOnClick}
          >
            Watch last 5 min replay
          </PrimaryActionButton>
        </Tooltip>
      </Row>
      <div className="session-replay-security-msg">
        <ShieldIcon />
        <div className="msg">
          To keep your information private, we save session replays on your browser locally, not in the cloud. You
          decide when to save them.
        </div>
      </div>
    </div>
  );
};

export default SessionRecordingView;
