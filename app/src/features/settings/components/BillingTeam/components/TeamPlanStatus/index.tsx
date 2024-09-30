import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Col, Row } from "antd";
import { capitalize } from "lodash";
import { PlanStatus } from "../../types";
import moment from "moment";
import "./index.scss";

export const TeamPlanStatus: React.FC<{
  subscriptionStatus: string;
  cancelAtPeriodEnd?: boolean;
  subscriptionEndDate?: string | number;
}> = ({ subscriptionEndDate, subscriptionStatus, cancelAtPeriodEnd = false }) => {
  const [searchParams] = useSearchParams();
  const redirectedFromCheckout = searchParams.get("redirectedFromCheckout");

  const daysLeftInCancellation = useMemo(() => {
    if (!subscriptionEndDate) {
      return;
    }

    const currentDate = moment();
    const endDate = moment(subscriptionEndDate);

    const daysLeft = endDate.diff(currentDate, "days") + 1;

    if (daysLeft > 15) {
      const todaysDate = moment(currentDate);
      todaysDate.add(daysLeft, "days");
      const formattedDate = todaysDate.format("Do MMM YYYY");
      return `Cancelling on ${formattedDate}`;
    }

    return `Cancelling in ${daysLeft} days`;
  }, [subscriptionEndDate]);

  let planStatus = PlanStatus.ACTIVE;
  if (!["active", "past_due", "trialing"].includes(subscriptionStatus) && !redirectedFromCheckout) {
    planStatus = PlanStatus.EXPIRED;
  }

  planStatus = subscriptionStatus === "active" && cancelAtPeriodEnd ? PlanStatus.EXPIRING_SOON : planStatus;

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
        <Col className="team-plan-status-badge-text">
          {planStatus === PlanStatus.EXPIRING_SOON && cancelAtPeriodEnd
            ? daysLeftInCancellation
            : capitalize(planStatus)}
        </Col>
        {/* TODO: add text for expired and expiring soon plan status */}
      </Row>
    </>
  );
};
