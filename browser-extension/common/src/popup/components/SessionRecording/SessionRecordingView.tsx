import React, { useEffect, useState } from "react";
import { Button, Col, Divider, Row, Typography } from "antd";
import config from "../../../config";
import { CLIENT_MESSAGES } from "../../../constants";
import VideoRecorderIcon from "../../../../resources/icons/videoRecorder.svg";
import "./sessionRecordingView.css";

const SessionRecordingView: React.FC = () => {
  const [currentTabId, setCurrentTabId] = useState<number>();
  const [isRecordingSession, setIsRecordingSession] = useState<boolean>();
  const [isExplicitRecordingSession, setIsExplicitRecordingSession] = useState<boolean>();

  const startRecordingOnClick = () => {
    chrome.tabs.sendMessage(currentTabId, { action: CLIENT_MESSAGES.START_RECORDING }, { frameId: 0 }, () =>
      setIsRecordingSession(true)
    );
  };

  const viewRecordedSession = () => {
    window.open(`${config.WEB_URL}/sessions/draft/${currentTabId}`, "_blank");
  };

  const stopRecordingOnClick = () => {
    if (isExplicitRecordingSession) {
      chrome.tabs.sendMessage(currentTabId, { action: CLIENT_MESSAGES.STOP_RECORDING }, { frameId: 0 }, () => {
        setIsRecordingSession(false);
        viewRecordedSession();
      });
    } else {
      viewRecordedSession();
    }
  };

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
        setIsExplicitRecordingSession
      );
    }
  }, [isRecordingSession]);

  return (
    <Row wrap={false} align="middle" justify="space-between" className="session-view-content">
      {isRecordingSession ? (
        <Row align="middle" justify="center">
          <div className="icon-wrapper">
            <VideoRecorderIcon />
          </div>
          <i className="record-indicator" />
          <Divider type="vertical" />
          <Typography.Text type="secondary">Session is being recorded on this page.</Typography.Text>
        </Row>
      ) : (
        <>
          <Row align="top">
            <Col>
              <div className="icon-wrapper session-recording-camera-icon">
                <VideoRecorderIcon />
              </div>
            </Col>
            <Col className="no-session-recording-message">
              <Typography.Text>No session recording</Typography.Text>
              <Typography.Text type="secondary" className="session-recording-caption">
                Record all network traffic, console logs & errors on current domain.
              </Typography.Text>
            </Col>
          </Row>
        </>
      )}

      <Col>
        {isRecordingSession ? (
          <Button type="link" target="_blank" className="session-view-link-button" onClick={stopRecordingOnClick}>
            <span>{isExplicitRecordingSession ? "Stop recording" : "View recording"}</span>
          </Button>
        ) : (
          <Typography.Link
            underline
            type="secondary"
            target="_blank"
            className="session-view-link-button"
            onClick={startRecordingOnClick}
          >
            Start Recording
          </Typography.Link>
        )}
      </Col>
    </Row>
  );
};

export default SessionRecordingView;
