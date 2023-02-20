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

const NetworkLogRow: React.FC<Props> = ({
  timeOffset,
  method,
  url,
  status,
  responseTime = 0,
  onClick,
  isSelected,
  showResponseTime,
}) => {
  const responseTimeInSeconds = useMemo(
    () => (responseTime / 1000).toFixed(3),
    [responseTime]
  );
  const isFailedRequest = useMemo(
    () => !status || (status >= 400 && status <= 599),
    [status]
  );
  const requestMethod = useMemo(() => method.toUpperCase(), [method]);

  return (
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
      <Tag
        color={REQUEST_METHOD_COLOR_CODES[requestMethod]}
        className="request-method-tag"
      >
        {requestMethod}
      </Tag>
      <span
        className={classNames("network-log-url", { failed: isFailedRequest })}
      >
        {url}
      </span>
    </SessionDetailsPanelRow>
  );
};

export default NetworkLogRow;
