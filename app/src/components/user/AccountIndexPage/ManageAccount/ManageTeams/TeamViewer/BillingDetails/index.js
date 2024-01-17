import React, { useEffect, useState } from "react";
import { Divider, Row, Col, Switch } from "antd";
import BillingFooter from "./BillingFooter";
import APP_CONSTANTS from "config/constants";
import { RQButton } from "lib/design-system/components";
import { useNavigate } from "react-router-dom";
import "./BillingDetails.css";
import { fetchBillingIdByOwner, toggleWorkspaceMappingInBillingTeam } from "backend/billing";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { toast } from "utils/Toast";

// Common Component for Team & Individual Payments
const BillingDetails = ({ isTeamAdmin, teamDetails }) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);

  const [billingId, setBillingId] = useState(null);
  const [isBillingTeamMapped, setIsBillingTeamMapped] = useState(false);

  useEffect(() => {
    fetchBillingIdByOwner(teamDetails.owner, user?.details?.profile?.uid).then(({ billingId, mappedWorkspaces }) => {
      setBillingId(billingId);
      setIsBillingTeamMapped(mappedWorkspaces?.includes(teamDetails.id));
    });
  });

  return isTeamAdmin ? (
    <div className="billing-details-container">
      <p className="text-gray billing-subscription-info">
        Members of this workspace are now integrated into a designated billing team. <br />
        Checkout the billing team for member information, plan details, invoices etc.
      </p>
      <Row gutter={8} align="middle">
        <Col>
          <RQButton
            type="primary"
            onClick={() => {
              if (billingId) {
                navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE + "/" + billingId);
              } else {
                toast.error("Billing team not found. Please contact support.");
              }
            }}
          >
            Go to billing team
          </RQButton>
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
          <Switch
            checked={isBillingTeamMapped}
            onChange={(checked) => {
              toggleWorkspaceMappingInBillingTeam(billingId, teamDetails.id, checked)
                .then(() => {
                  if (checked) {
                    toast.success("Members will be automatically added to the billing team.");
                  } else {
                    toast.warn("Members will not be automatically added to the billing team.");
                  }
                  setIsBillingTeamMapped(checked);
                })
                .catch(() => {
                  setIsBillingTeamMapped(!checked);
                  toast.error("Something went wrong. Please contact support.");
                });
            }}
          />
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
