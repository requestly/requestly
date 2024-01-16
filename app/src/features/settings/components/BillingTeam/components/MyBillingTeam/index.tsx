import React from "react";
import { Col } from "antd";
import { TeamPlanDetails } from "./components/TeamPlanDetails";
import { BillingTeamMembers } from "./components/BillingTeamMembers";

export const MyBillingTeam: React.FC = () => {
  return (
    <>
      <Col className="my-billing-team-title">Parth's Billing team</Col>
      <Col className="mt-8">
        <TeamPlanDetails />
      </Col>
      <Col style={{ marginTop: "24px" }}>
        <BillingTeamMembers />
      </Col>
      {/* ADD INVOICES TABLE */}
      {/* ADD BILLING ADDRESS AND PAYMENT METHOD SECTION */}
    </>
  );
};
