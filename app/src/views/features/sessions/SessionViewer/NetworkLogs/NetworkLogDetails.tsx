import { CloseCircleOutlined } from "@ant-design/icons";
import { Button, Tabs, Tooltip } from "antd";
import React, { useMemo } from "react";
import { NetworkLog } from "../types";
import NetworkLogProperty from "./NetworkLogProperty";
import NetworkStatusField from "./NetworkStatusField";
import NetworkPayload from "./NetworkPayload";

type Props = NetworkLog & {
  onClose?: () => void;
};

const NetworkLogDetails: React.FC<Props> = ({
  url,
  method,
  requestData,
  response,
  responseURL,
  contentType,
  status,
  statusText,
  responseTime,
  onClose,
}) => {
  const closeAction = useMemo(
    () => (
      <Tooltip title="Close" placement="right">
        <Button icon={<CloseCircleOutlined />} onClick={onClose} type="text" />
      </Tooltip>
    ),
    [onClose]
  );

  const responseTimeInSeconds = useMemo(
    () => (responseTime / 1000).toFixed(3),
    [responseTime]
  );

  return (
    <div className="network-log-details">
      <Tabs tabBarExtraContent={closeAction}>
        <Tabs.TabPane tab="Request" key="request">
          <div className="network-log-details-tab-content">
            <NetworkLogProperty label="URL">{url}</NetworkLogProperty>
            {responseURL !== url ? (
              <NetworkLogProperty label="Redirected URL">
                {responseURL}
              </NetworkLogProperty>
            ) : null}
            <NetworkLogProperty label="Method">
              {method?.toUpperCase() ?? "GET"}
            </NetworkLogProperty>
            <NetworkPayload label="Payload" payload={requestData} />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Response" key="response">
          <div className="network-log-details-tab-content">
            <NetworkLogProperty label="Status">
              <NetworkStatusField status={status} statusText={statusText} />
            </NetworkLogProperty>
            <NetworkLogProperty label="Response Time">
              {responseTimeInSeconds} sec
            </NetworkLogProperty>
            <NetworkLogProperty label="Content Type">
              {contentType}
            </NetworkLogProperty>
            <NetworkPayload label="Body" payload={response} />
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default NetworkLogDetails;
