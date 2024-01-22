import React from "react";
import { useSearchParams } from "react-router-dom";
import { Col, Row } from "antd";
import { capitalize } from "lodash";
import { PlanStatus } from "../../types";
import "./index.scss";

export const TeamPlanStatus: React.FC<{ subscriptionStatus: string }> = ({ subscriptionStatus }) => {
  const [searchParams] = useSearchParams();
  const redirectedFromCheckout = searchParams.get("redirectedFromCheckout");

  let planStatus = PlanStatus.ACTIVE;
  if (!["active", "past_due", "trialing"].includes(subscriptionStatus) && !redirectedFromCheckout) {
    planStatus = PlanStatus.EXPIRED;
  }

  return (
    <>
      <Row
        align="middle"
        className={`team-plan-status-badge ${
          planStatus === PlanStatus.ACTIVE
            ? "plan-status-active-badge "
            : //@ts-ignore
            planStatus === PlanStatus.EXPIRING_SOON
            ? "plan-status-warning-badge"
            : "plan-status-expired-badge"
        }

    }`}
      >
        <Col
          className={`team-plan-status-badge-dot ${
            planStatus === PlanStatus.ACTIVE
              ? "plan-status-active-dot"
              : //@ts-ignore
              planStatus === PlanStatus.EXPIRING_SOON
              ? "plan-status-warning-dot"
              : "plan-status-expired-dot"
          }`}
        ></Col>{" "}
        <Col className="team-plan-status-badge-text">{capitalize(planStatus)}</Col>
        {/* TODO: add text for expired and expiring soon plan status */}
      </Row>
    </>
  );
};
