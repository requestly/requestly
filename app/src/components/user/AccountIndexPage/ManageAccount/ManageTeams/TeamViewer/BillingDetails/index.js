import React, { useEffect, useState } from "react";
import { Divider, Row, Col, Typography } from "antd";
import APP_CONSTANTS from "config/constants";
import { RQButton } from "lib/design-system/components";
import { useNavigate } from "react-router-dom";
import "./BillingDetails.css";
import { fetchBillingIdByOwner, toggleWorkspaceMappingInBillingTeam } from "backend/billing";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { toast } from "utils/Toast";
import { redirectToUrl } from "utils/RedirectionUtils";
import SettingsItem from "features/settings/components/GlobalSettings/components/SettingsItem";

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
        Members of this workspace are now integrated into a designated billing team.
        <br /> Please refer to the billing team for plan details, invoices, and more.
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
              redirectToUrl("https://developers.requestly.io/faq/billing-team/", true);
            }}
          >
            Learn more
          </RQButton>
        </Col>
      </Row>

      <Divider className="manage-workspace-divider" />
      <Row className="w-full">
        <SettingsItem
          isActive={isBillingTeamMapped}
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
          title="Automatically include members who join this workspace in the billing team"
          caption="Enable automatic inclusion in the billing team for members joining this workspace"
        />
      </Row>
      <Typography.Text className="billing-non-admin-message">
        Premium features will be enabled for the users who are part of a billing team
      </Typography.Text>
    </div>
  ) : (
    <p className="billing-non-admin-message">Only admin can view the billing details.</p>
  );
};

export default BillingDetails;
