import React, { useMemo } from "react";
import { RQAPI } from "../../../../../../types";
import { Popover, Space } from "antd";
import PropertyRow from "./PropertyRow/PropertyRow";
import { statusCodes } from "config/constants/sub/statusCode";
import NetworkStatusField from "components/misc/NetworkStatusField";
import { NodeIndexOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system-v2/components";

interface Props {
  response: RQAPI.Response;
}

const StatusLine: React.FC<Props> = ({ response }) => {
  const formattedTime = useMemo(() => {
    if (response?.time) {
      const ms = Math.ceil(response.time);

      if (ms < 1000) {
        return (
          <>
            {ms} <i>ms</i>
          </>
        );
      }

      return (
        <>
          {(ms / 1000).toFixed(3)} <i>s</i>
        </>
      );
    }

    return "";
  }, [response?.time]);

  const formattedStatusText = useMemo(() => {
    // @ts-ignore
    return response?.statusText || statusCodes[response?.status];
  }, [response?.status, response?.statusText]);

  if (!response) {
    return null;
  }

  return (
    <Space className="api-response-status-line" size={0}>
      {response.redirectedUrl && (
        <Popover content={response.redirectedUrl}>
          <RQButton type="transparent" size="small" icon={<NodeIndexOutlined />}>
            Redirected
          </RQButton>
        </Popover>
      )}
      <PropertyRow
        name="Status"
        value={<NetworkStatusField status={response.status} statusText={formattedStatusText} />}
      />
      <PropertyRow name="Time" value={formattedTime} />
    </Space>
  );
};

export default StatusLine;
