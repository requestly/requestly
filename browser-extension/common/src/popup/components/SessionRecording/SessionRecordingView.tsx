import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Row, Typography } from "antd";
import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "../../../constants";
import VideoRecorderIcon from "../../../../resources/icons/videoRecorder.svg";
import { EyeOutlined, PlayCircleFilled } from "@ant-design/icons";
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

  const viewRecordingOnClick = useCallback(
    (stopRecording?: boolean) => {
      if (isManualMode || stopRecording) {
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
    },
    [isManualMode, currentTabId]
  );

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

  return (
    <Row
      wrap={false}
      align="middle"
      justify="space-between"
      className="session-view-content"
      style={{
        backgroundColor: isRecordingSession ? (isManualMode ? "#295FF6" : "#B429F6") : "transparent",
      }}
    >
      {isRecordingSession ? (
        <Row align="middle" justify="center">
          <div className="icon-wrapper session-recording-camera-icon">
            <VideoRecorderIcon />
          </div>

          <Col>
            {isManualMode ? (
              <>
                <Typography.Text strong className="">
                  Recording...
                </Typography.Text>
                <br />
                <Typography.Text className="custom-mode-caption">
                  This tab is being recorded by session Replay
                </Typography.Text>
              </>
            ) : (
              <>
                <Typography.Text strong>Automatically recording</Typography.Text>
                <br />
                <Button
                  type="link"
                  target="_blank"
                  className="session-view-link-button"
                  onClick={() => viewRecordingOnClick(true)}
                >
                  <span className="stop-recording-text">Stop recording</span>
                </Button>
              </>
            )}
          </Col>
        </Row>
      ) : (
        <>
          <Row align="middle">
            <Col>
              <div className="icon-wrapper session-recording-camera-icon">
                <VideoRecorderIcon />
              </div>
            </Col>
            <Col className="no-session-recording-message">
              <Typography.Text type="secondary" className="session-recording-caption">
                Capture <span>mouse movement</span>, <span>console</span>, <span>network & environment data</span>
                <br />
                automatically for sharing and debugging
              </Typography.Text>
            </Col>
          </Row>
        </>
      )}

      <Col>
        {isRecordingSession ? (
          <Button
            type="link"
            target="_blank"
            className="session-view-link-button"
            onClick={() => viewRecordingOnClick()}
          >
            <EyeOutlined /> <span>{isManualMode ? "Stop & watch replay" : "Watch replay"}</span>
          </Button>
        ) : (
          <Typography.Link
            underline
            type="secondary"
            target="_blank"
            className="session-start-recording-link"
            onClick={startRecordingOnClick}
          >
            <PlayCircleFilled />
            <span>Start Recording</span>
          </Typography.Link>
        )}
      </Col>
    </Row>
  );
};

export default SessionRecordingView;
