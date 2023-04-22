import React, { useMemo } from "react";
import { RQAPI } from "../../types";
import { Space } from "antd";
import PropertyRow from "./PropertyRow/PropertyRow";
import { statusCodes } from "config/constants/sub/statusCode";
import NetworkStatusField from "components/misc/NetworkStatusField";

interface Props {
  response: RQAPI.Response;
}

const StatusLine: React.FC<Props> = ({ response }) => {
  const formattedTime = useMemo(() => {
    if (response.time) {
      const ms = Math.ceil(response.time);

      if (ms < 1000) {
        return `${ms} ms`;
      }

      return `${(ms / 1000).toFixed(3)} s`;
    }

    return "";
  }, [response.time]);

  const formattedStatusText = useMemo(() => {
    // @ts-ignore
    return response.statusText || statusCodes[response.status];
  }, [response.status, response.statusText]);

  return (
    <Space>
      <PropertyRow
        name="Status"
        value={<NetworkStatusField status={response.status} statusText={formattedStatusText} />}
      />
      <PropertyRow name="Time" value={formattedTime} />
    </Space>
  );
};

export default StatusLine;
