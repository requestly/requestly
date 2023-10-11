import React, { ReactNode, useMemo } from "react";
import { Col, Row, Typography } from "antd";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import { ClockCircleOutlined } from "@ant-design/icons";
import { isAppOpenedInIframe } from "utils/AppUtils";

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
  const isInsideIframe = useMemo(isAppOpenedInIframe, []);

  return (
    <>
      <Row className={`session-details-panel-row ${className}`} onClick={onClick}>
        <Row align="top" gutter={8}>
          <Col
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
          </Col>
          <Col style={{ flex: 1 }}>
            <div className="primary-message" style={{ display: "flex", alignItems: "flex-start" }}>
              {children}
            </div>
            {!isInsideIframe && secondaryMessage && <div className="secondary-message">{secondaryMessage}</div>}
          </Col>
          {!isInsideIframe && <Col className="right-info">{rightInfo}</Col>}
        </Row>
      </Row>
    </>
  );
};

export default SessionDetailsPanelRow;
