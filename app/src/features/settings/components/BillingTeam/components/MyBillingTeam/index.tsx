import React from "react";
import { Col } from "antd";
import { TeamPlanDetails } from "./components/TeamPlanDetails";
import { BillingTeamMembers } from "./components/BillingTeamMembers";
import { BillingInvoiceTable } from "./components/BillingInvoiceTable";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getBillingTeamById } from "store/features/billing/selectors";

export const MyBillingTeam: React.FC = () => {
  const { billingId } = useParams();

  const billingTeamDetails = useSelector(getBillingTeamById(billingId));

  if (!billingTeamDetails) return null;

  return (
    <>
      <Col className="my-billing-team-title">{billingTeamDetails.name}</Col>
      <Col className="mt-8">
        <TeamPlanDetails billingTeamDetails={billingTeamDetails} />
      </Col>
      <Col style={{ marginTop: "24px" }}>
        <BillingTeamMembers />
      </Col>
      <Col style={{ marginTop: "24px" }}>
        <BillingInvoiceTable />
      </Col>
      {/* TODO: ADD BILLING ADDRESS AND PAYMENT METHOD SECTION */}
    </>
  );
};
