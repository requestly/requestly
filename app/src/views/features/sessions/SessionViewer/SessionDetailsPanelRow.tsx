import React, { ReactNode } from "react";
import { Divider, Typography } from "antd";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import { ClockCircleOutlined } from "@ant-design/icons";

interface Props {
  timeOffset: number;
  children: ReactNode;
  rightInfo?: ReactNode;
  secondaryMessage?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const SessionDetailsPanelRow: React.FC<Props> = ({
  timeOffset,
  children,
  rightInfo,
  secondaryMessage,
  className = "",
  onClick,
}) => {
  return (
    <>
      <div
        className={`session-details-panel-row ${className}`}
        onClick={onClick}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{ display: "flex", alignItems: "start", columnGap: "8px" }}
          >
            <div
              style={{
                flexShrink: 0,
                verticalAlign: "top",
                lineHeight: "12px",
              }}
            >
              <Typography.Text type="secondary">
                <ClockCircleOutlined style={{ marginRight: "4px" }} />
                {timeOffset < 0 ? "00:00" : secToMinutesAndSeconds(timeOffset)}
              </Typography.Text>
            </div>
            <Divider type="vertical" style={{ margin: 0, height: "100%" }} />
            <div>
              <div
                className="primary-message"
                style={{ display: "flex", alignItems: "start" }}
              >
                {children}
              </div>
              {secondaryMessage && (
                <div className="secondary-message">{secondaryMessage}</div>
              )}
            </div>
          </div>
          <div className="right-info">{rightInfo}</div>
        </div>
      </div>
      <Divider style={{ margin: 0 }} />
    </>
  );
};

export default SessionDetailsPanelRow;
