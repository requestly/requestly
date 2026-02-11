import React, { useMemo } from "react";
import { RQAPI } from "../../../../../../types";
import { Popover, Space } from "antd";
import PropertyRow from "./PropertyRow/PropertyRow";
import { statusCodes } from "config/constants/sub/statusCode";
import NetworkStatusField from "components/misc/NetworkStatusField";
import { MdOutlineSwapCalls } from "@react-icons/all-files/md/MdOutlineSwapCalls";
import { isHttpResponse } from "features/apiClient/screens/apiClient/utils";

interface Props {
  response: RQAPI.Response;
}

const StatusLine: React.FC<Props> = ({ response }) => {
  const formattedTime = useMemo(() => {
    if (response?.time) {
      const ms = Math.ceil(response.time);

      if (ms < 1000) {
        return <>{ms} ms</>;
      }

      return <>{(ms / 1000).toFixed(3)} s</>;
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
    <Space className="api-response-status-row">
      {isHttpResponse(response) && response.redirectedUrl && (
        <Popover content={response.redirectedUrl}>
          <div className="api-response-status-row__redirected">
            <MdOutlineSwapCalls /> <span>REDIRECTED</span>
          </div>
        </Popover>
      )}
      <PropertyRow
        name="Status"
        className="api-response-status-row__status"
        value={<NetworkStatusField status={response.status} statusText={formattedStatusText} />}
      />
      <PropertyRow className="api-response-status-row__time" name="Time" value={formattedTime} />
    </Space>
  );
};

export default StatusLine;
