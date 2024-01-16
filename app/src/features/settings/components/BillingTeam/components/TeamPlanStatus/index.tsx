import React from "react";
import { PlanStatus } from "../../types";
import { Col, Row } from "antd";
import { capitalize } from "lodash";
import "./index.scss";

export const TeamPlanStatus: React.FC = () => {
  const planStatus = PlanStatus.ACTIVE;
  return (
    <Row
      align="middle"
      className={`team-plan-status-badge ${
        planStatus === PlanStatus.ACTIVE
          ? "plan-status-active-badge "
          : planStatus === PlanStatus.EXPIRING_SOON
          ? "plan-status-warning-badge"
          : "plan-status-expired-badge"
      }
        
    }`}
    >
      <Col
        className={`team-plan-status-badge-dot ${
          planStatus === PlanStatus.ACTIVE
            ? "plan-status-active-dot"
            : planStatus === PlanStatus.EXPIRING_SOON
            ? "plan-status-warning-dot"
            : "plan-status-expired-dot"
        }`}
      ></Col>{" "}
      <Col className="team-plan-status-badge-text">{capitalize(planStatus)}</Col>
      {/* TODO: add text for expired and expiring soon plan status */}
    </Row>
  );
};
