import React, { useCallback, useEffect, useState } from "react";
import { Row, Tooltip } from "antd";
import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "../../../constants";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import SettingIcon from "../../../../resources/icons/setting.svg";
import PlayRecordingIcon from "../../../../resources/icons/playRecording.svg";
import StopRecordingIcon from "../../../../resources/icons/stopRecording.svg";
import ReplayLastFiveMinuteIcon from "../../../../resources/icons/replayLastFiveMinute.svg";
import InfoIcon from "../../../../resources/icons/info.svg";
import ShieldIcon from "../../../../resources/icons/shield.svg";
import config from "../../../config";
import { EVENT, sendEvent } from "../../events";
import "./sessionRecordingView.css";

const SessionRecordingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab>();
  const [isRecordingSession, setIsRecordingSession] = useState<boolean>();
  const [isManualMode, setIsManualMode] = useState<boolean>();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const currentTabId = activeTab?.id;
  const isRecordingInManualMode = isRecordingSession && isManualMode;

  const startRecordingOnClick = useCallback(() => {
    sendEvent(EVENT.START_RECORDING_CLICKED, { type: "manual" });
    chrome.runtime.sendMessage({
      action: EXTENSION_MESSAGES.START_RECORDING_EXPLICITLY,
      tab: activeTab,
      showWidget: true,
    });
    setIsManualMode(true);
    setIsRecordingSession(true);
  }, [activeTab]);

  const viewRecordingOnClick = useCallback(() => {
    if (isManualMode) {
      sendEvent(EVENT.STOP_RECORDING_CLICKED, { recording_mode: "manual" });
      chrome.runtime.sendMessage({
        action: EXTENSION_MESSAGES.STOP_RECORDING,
        tabId: currentTabId,
        openRecording: true,
      });
      setIsRecordingSession(false);
    } else {
      sendEvent(EVENT.VIEW_RECORDING_CLICKED, { recording_mode: "auto" });
      chrome.runtime.sendMessage({
        action: EXTENSION_MESSAGES.WATCH_RECORDING,
        tabId: currentTabId,
      });
    }
  }, [isManualMode, currentTabId]);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, ([activeTab]) => {
      setActiveTab(activeTab);
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

  useEffect(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.GET_IS_USER_LOGGED_IN }, (isLoggedIn) => {
      setIsUserLoggedIn(isLoggedIn);
    });
  }, []);

  const handleConfigureBtnClick = useCallback(() => {
    sendEvent(EVENT.SESSION_RECORDINGS_CONFIG_OPENED);
    window.open(`${config.WEB_URL}/settings/sessions-settings?source=popup`, "_blank");
  }, []);

  const handleViewLastFiveMinReplay = useCallback(() => {
    if (!isUserLoggedIn) {
      window.open(`${config.WEB_URL}/sessions?loginRequired`, "_blank");
      return;
    }
    viewRecordingOnClick();
  }, [isUserLoggedIn, viewRecordingOnClick]);

  const handleManualRecordingButtonClick = useCallback(() => {
    if (!isUserLoggedIn) {
      window.open(`${config.WEB_URL}/sessions?loginRequired`, "_blank");
      return;
    }
    if (isRecordingInManualMode) {
      viewRecordingOnClick();
    } else {
      startRecordingOnClick();
    }
  }, [isRecordingInManualMode, isUserLoggedIn, startRecordingOnClick, viewRecordingOnClick]);

  const watchReplayBtnTooltipContent =
    isRecordingInManualMode || !isRecordingSession ? (
      <div className="watch-replay-btn-tooltip-content">
        <InfoIcon />
        <div>
          <span>Auto recording is disabled for this page. Please Enable it in SessionBook settings.</span>{" "}
          <button onClick={handleConfigureBtnClick}>Enable now.</button>
        </div>
      </div>
    ) : (
      <>Instantly play last 5 min auto recorded session for this tab.</>
    );

  return (
    <div className="session-view-content">
      <Row align="middle" justify="space-between">
        <div className="title">Record session for sharing & debugging</div>
        <div className="configure-btn" onClick={handleConfigureBtnClick}>
          <SettingIcon /> Configure
        </div>
      </Row>
      <Row wrap={false} align="middle" className="action-btns">
        <Tooltip
          placement="top"
          color="#000000"
          title="Capture mouse movement, console, network and more."
          overlayClassName="action-btn-tooltip"
        >
          <PrimaryActionButton
            block
            className={isRecordingInManualMode ? "stop-btn" : ""}
            icon={isRecordingInManualMode ? <StopRecordingIcon /> : <PlayRecordingIcon />}
            onClick={handleManualRecordingButtonClick}
          >
            {isRecordingInManualMode ? "Stop and watch" : " Record this tab"}
          </PrimaryActionButton>
        </Tooltip>

        <Tooltip
          placement="top"
          color="#000000"
          title={watchReplayBtnTooltipContent}
          overlayClassName="action-btn-tooltip watch-replay-btn"
        >
          <span className="buttonWrapper">
            <PrimaryActionButton
              block
              icon={<ReplayLastFiveMinuteIcon />}
              disabled={isRecordingInManualMode || !isRecordingSession}
              onClick={handleViewLastFiveMinReplay}
            >
              Watch last 5 min replay
            </PrimaryActionButton>
          </span>
        </Tooltip>
      </Row>
      <div className="session-replay-security-msg">
        <ShieldIcon />
        <div className="msg">Sessions are recorded locally in your browser.</div>
      </div>
    </div>
  );
};

export default SessionRecordingView;
