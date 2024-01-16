import React from "react";
import { Col } from "antd";
import { TeamPlanDetails } from "../TeamPlanDetails";

export const MyBillingTeam: React.FC = () => {
  return (
    <>
      <Col className="my-billing-team-title">Parth's Billing team</Col>
      <Col className="mt-8">
        <TeamPlanDetails />
      </Col>
    </>
  );
};
