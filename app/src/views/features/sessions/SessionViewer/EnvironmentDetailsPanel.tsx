import React from "react";
import { Environment } from "@requestly/web-sdk";
import { Descriptions } from "antd";

const aggregate = (...values: (string | number)[]): string => {
  return values.filter((v) => !!v).join(" ");
};

const EnvironmentDetailsPanel: React.FC<{ environment: Environment }> = ({ environment }) => {
  return environment ? (
    <div className="session-panel-content placeholder">
      <Descriptions bordered labelStyle={{ padding: "2px 10px" }} contentStyle={{ padding: "2px 10px" }}>
        <Descriptions.Item label="Browser" span={3}>
          {aggregate(environment.browser.name, environment.browser.version)}
        </Descriptions.Item>
        <Descriptions.Item label="Operating system" span={3}>
          {aggregate(environment.os.name, environment.os.versionName, environment.os.version)}
          {environment.os.name === "macOS" && environment.os.version === "10.15.7" ? ` (or above)` : null}
        </Descriptions.Item>
        <Descriptions.Item label="Platform" span={3}>
          {aggregate(environment.platform.vendor, environment.platform.type, environment.platform.model)}
        </Descriptions.Item>
        <Descriptions.Item label="Screen dimensions" span={3}>
          {environment.screenDimensions.width} x {environment.screenDimensions.height}
        </Descriptions.Item>
        <Descriptions.Item label="Browser dimensions" span={3}>
          {environment.browserDimensions.width} x {environment.browserDimensions.height}
        </Descriptions.Item>
        <Descriptions.Item label="Device pixel ratio" span={3}>
          {environment.devicePixelRatio}
        </Descriptions.Item>
        <Descriptions.Item label="Language" span={3}>
          {environment.language}
        </Descriptions.Item>
        <Descriptions.Item label="User-Agent" span={3}>
          {environment.userAgent}
        </Descriptions.Item>
      </Descriptions>
    </div>
  ) : null;
};

export default React.memo(EnvironmentDetailsPanel);
