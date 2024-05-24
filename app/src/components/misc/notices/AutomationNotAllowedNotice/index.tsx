import React, { useEffect, useState } from "react";
import { Typography } from "antd";
import "../common.scss";
import { isEnvAutomation } from "utils/EnvUtils";

const AutomationNotAllowedNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isEnvAutomation()) {
      setVisible(true);
    }
  }, []);

  return visible ? (
    <div className="top-banner-notice">
      <Typography.Text>
        Running Requestly in automation without explicit permission is prohibited. Please contact support.
      </Typography.Text>
    </div>
  ) : null;
};

export default AutomationNotAllowedNotice;
