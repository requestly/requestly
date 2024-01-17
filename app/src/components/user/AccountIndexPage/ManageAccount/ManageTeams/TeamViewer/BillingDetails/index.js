import React from "react";
import { Divider, Row, Col, Switch } from "antd";
import BillingFooter from "./BillingFooter";
import APP_CONSTANTS from "config/constants";
import { RQButton } from "lib/design-system/components";
import { useNavigate } from "react-router-dom";
import "./BillingDetails.css";

// Common Component for Team & Individual Payments
const BillingDetails = ({ teamId, isTeamAdmin, teamDetails }) => {
  const navigate = useNavigate();

  // const handleRedirectToUpdatePaymentMethod = () => {
  //   if (!subscriptionInfo.subscriptionStatus) return;

  //   redirectToUpdatePaymentMethod({
  //     mode: "team",
  //     teamId: teamId,
  //   });
  // };

  return isTeamAdmin ? (
    <div className="billing-details-container">
      <p className="text-gray billing-subscription-info">
        Members of this workspace are now integrated into a designated billing team. <br />
        Checkout the billing team for member information, plan details, invoices etc.
      </p>
      <Row gutter={8} align="middle">
        <Col>
          {/* TODO: Redirect to billing team */}
          <RQButton type="primary">Go to billing team</RQButton>
        </Col>
        <Col>
          <RQButton
            type="default"
            onClick={() => {
              navigate(APP_CONSTANTS.PATHS.PRICING.ABSOLUTE);
            }}
          >
            Learn more
          </RQButton>
        </Col>
      </Row>

      <Divider className="manage-workspace-divider" />
      <Row gutter={8}>
        <Col>Automatically include members who join this workspace in the billing team</Col>
        <Col>
          <Switch checked={teamDetails.billingId ?? false} />
        </Col>
      </Row>
      <Divider className="manage-workspace-divider" />
      <BillingFooter />
    </div>
  ) : (
    <p className="billing-non-admin-message">Only admin can view the billing details.</p>
  );
};

export default BillingDetails;
