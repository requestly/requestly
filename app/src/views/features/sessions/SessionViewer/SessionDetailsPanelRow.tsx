import React, { ReactNode, useMemo } from "react";
import { Col, Row, Typography } from "antd";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import { ClockCircleOutlined } from "@ant-design/icons";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { AiFillCaretRight } from "@react-icons/all-files/ai/AiFillCaretRight";

interface Props {
  id: string;
  timeOffset: number;
  children: ReactNode;
  rightInfo?: ReactNode;
  isRecent?: boolean;
  secondaryMessage?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const SessionDetailsPanelRow: React.FC<Props> = ({
  id,
  timeOffset,
  children,
  rightInfo,
  isRecent,
  secondaryMessage,
  className = "",
  onClick,
}) => {
  const isInsideIframe = useMemo(isAppOpenedInIframe, []);

  return (
    <>
      <Row className={`session-details-panel-row ${className}`} onClick={onClick} data-resource-id={id}>
        <Col span={24} className="display-flex">
          <Col>
            <Row align="middle" className="log-offset-row">
              {isRecent ? <AiFillCaretRight className="recent-log-pointer" /> : <div></div>}
              <Typography.Text type="secondary" className="log-offset">
                <ClockCircleOutlined /> {timeOffset < 0 ? "00:00" : secToMinutesAndSeconds(Math.floor(timeOffset))}
              </Typography.Text>
            </Row>
          </Col>
          <Col span={17} sm={14} lg={16} xxl={17}>
            <div className="primary-message" style={{ display: "flex", alignItems: "flex-start" }}>
              {children}
            </div>
            {!isInsideIframe && secondaryMessage && <div className="secondary-message">{secondaryMessage}</div>}
          </Col>
          {!isInsideIframe && (
            <Col span={6} className="right-info">
              {rightInfo}
            </Col>
          )}
        </Col>
      </Row>
    </>
  );
};

export default SessionDetailsPanelRow;
