import { Tag, Tooltip } from "antd";
import classNames from "classnames";
import React, { useMemo } from "react";
import SessionDetailsPanelRow from "../SessionDetailsPanelRow";
import { NetworkLog } from "../types";

type Props = NetworkLog & {
  onClick?: () => void;
  isSelected?: boolean;
  showResponseTime?: boolean;
};

const REQUEST_METHOD_COLOR_CODES: Record<string, string> = {
  GET: "green",
  POST: "blue",
  PUT: "cyan",
  PATCH: "geekblue",
  DELETE: "red",
};

const RESPONSE_STATUS_COLOR_CODES: Record<string, string> = {
  "0": "#FF4D4F",
  "1": "#E3A324",
  "2": "#4EB433",
  "3": "#106D7A",
  "4": "#FA0C1E",
  "5": "#FF4D4F",
};

const NetworkLogRow: React.FC<Props> = ({
  timeOffset,
  method,
  url,
  responseURL,
  status,
  responseTime = 0,
  onClick,
  isSelected,
  showResponseTime,
}) => {
  const responseTimeInSeconds = useMemo(() => (responseTime / 1000).toFixed(3), [responseTime]);
  const isFailedRequest = useMemo(() => !status || (status >= 400 && status <= 599), [status]);
  const requestMethod = useMemo(() => method?.toUpperCase() ?? "GET", [method]);

  const networkUrl = useMemo(() => url || responseURL, [url, responseURL]);

  return !networkUrl ? null : (
    <SessionDetailsPanelRow
      className={`network-log-row ${isSelected ? "selected" : ""}`}
      timeOffset={timeOffset}
      rightInfo={
        showResponseTime ? (
          <Tooltip placement="left" title="Response time">
            <span>{responseTimeInSeconds}s</span>
          </Tooltip>
        ) : null
      }
      onClick={onClick}
    >
      <Tag color={REQUEST_METHOD_COLOR_CODES[requestMethod]} className="request-method-tag">
        {requestMethod}
      </Tag>
      <Tag color={RESPONSE_STATUS_COLOR_CODES[status?.toString()?.[0]]} className="request-method-tag">
        {status}
      </Tag>
      <span className={classNames("network-log-url", { failed: isFailedRequest })}>{networkUrl}</span>
    </SessionDetailsPanelRow>
  );
};

export default NetworkLogRow;
