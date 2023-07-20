import React from "react";
import { useLocation } from "react-router-dom";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Checkbox, Radio, RadioChangeEvent, Row } from "antd";
import { SessionSaveMode } from "./types";
import { CheckboxValueType } from "antd/lib/checkbox/Group";

interface Props {
  isSaving?: boolean;
  sessionSaveMode: SessionSaveMode;
  includedDebugInfo: CheckboxValueType[];
  setIncludedDebugInfo: (mode: CheckboxValueType[]) => void;
  onClose: (e: React.MouseEvent) => void;
  isIncludeNetworkLogsDisabled: boolean;
  isIncludeConsoleLogsDisabled: boolean;
  handleSessionSaveModeChange?: (e: RadioChangeEvent) => void;
  saveDraftSession?: (e: React.MouseEvent) => void;
  handleDownloadFileClick: (e: React.MouseEvent) => void;
}

const SaveRecordingConfigPopup: React.FC<Props> = ({
  onClose,
  isSaving = false,
  sessionSaveMode,
  saveDraftSession,
  handleDownloadFileClick,
  handleSessionSaveModeChange,
  includedDebugInfo,
  setIncludedDebugInfo,
  isIncludeConsoleLogsDisabled,
  isIncludeNetworkLogsDisabled,
}) => {
  const { pathname } = useLocation();
  const isDraftSession = pathname.includes("draft");

  return (
    <div className="save-recording-config-popup">
      <Row align="middle" justify="space-between" className="w-full header-container">
        <div className="header">{isDraftSession ? "Save" : "Download"} your session recording</div>
        <Button onClick={onClose}>
          <CloseOutlined />
        </Button>
      </Row>
      <div className="config-container">
        {isDraftSession && (
          <div>
            <div className="config-label">Mode of saving the session</div>
            <Radio.Group value={sessionSaveMode} onChange={handleSessionSaveModeChange} className="mode-radio-group">
              <Radio value={SessionSaveMode.ONLINE}>Save online</Radio>
              <Radio value={SessionSaveMode.LOCAL}>Download JSON file</Radio>
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
          onClick={sessionSaveMode === SessionSaveMode.ONLINE ? saveDraftSession : handleDownloadFileClick}
        >
          {sessionSaveMode === SessionSaveMode.ONLINE ? "Save" : "Download"}
        </Button>
      </Row>
    </div>
  );
};

export default SaveRecordingConfigPopup;
