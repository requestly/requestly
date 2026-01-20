import { StopOutlined } from "@ant-design/icons";
import { Button, Checkbox, Divider } from "antd";
import React, { useCallback } from "react";
import { NetworkSettings } from "../../../types";

interface Props {
  clearEvents: () => void;
  settings: NetworkSettings;
  onSettingsChange: (settings: NetworkSettings) => void;
}

const PrimaryToolbar: React.FC<Props> = ({ clearEvents, settings, onSettingsChange }) => {
  const onPreserveLogSettingChanged = useCallback(
    (newPreserveLogSetting: boolean) => {
      onSettingsChange({
        ...settings,
        preserveLog: newPreserveLogSetting,
      });
    },
    [settings]
  );

  return (
    <div className="executions-toolbar primary">
      <div>
        <Button icon={<StopOutlined />} type="text" className="clear-events-button" onClick={clearEvents}>
          Clear logs
        </Button>
        <Divider type="vertical" className="divider" />
        <Checkbox
          className="preserve-log-checkbox"
          checked={settings.preserveLog}
          onChange={(e) => onPreserveLogSettingChanged(e.target.checked)}
        >
          Preserve log
        </Checkbox>
      </div>
    </div>
  );
};

export default PrimaryToolbar;
