import React from "react";
import { Button, Row, Typography } from "antd";
import SessionRecordingView from "../SessionRecording/SessionRecordingView";
import PlayIcon from "../../../../resources/icons/play.svg";

interface PopupFooterProps {
  isExtensionEnabled: boolean;
  handleToggleExtensionStatus: () => void;
}

const PopupFooter: React.FC<PopupFooterProps> = ({
  isExtensionEnabled,
  handleToggleExtensionStatus,
}) => {
  return (
    <Row align="middle" className="popup-footer">
      {isExtensionEnabled ? (
        <SessionRecordingView />
      ) : (
        <>
          <Button
            danger
            className="popup-footer-resume-btn"
            onClick={handleToggleExtensionStatus}
          >
            <PlayIcon />
            <span className="popup-footer-resume-btn-text">Resume</span>
          </Button>

          <Typography.Text type="secondary">
            When paused, rules won't be applied and sessions won't be recorded.
          </Typography.Text>
        </>
      )}
    </Row>
  );
};

export default PopupFooter;
