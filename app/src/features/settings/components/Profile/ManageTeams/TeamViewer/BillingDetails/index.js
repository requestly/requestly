import React, { useEffect, useState } from "react";
import { Divider, Row, Col, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { useNavigate } from "react-router-dom";
import "./BillingDetails.css";
import { fetchBillingIdByOwner, toggleWorkspaceMappingInBillingTeam } from "backend/billing";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { toast } from "utils/Toast";
import { redirectToBillingTeam, redirectToUrl } from "utils/RedirectionUtils";
import SettingsItem from "features/settings/components/GlobalSettings/components/SettingsItem";
import {
  trackWorkspaceSettingsAutomaticMappingToggleClicked,
  trackWorkspaceSettingsGoToBillingTeamClicked,
  trackWorkspaceSettingsLearnMoreClicked,
} from "features/settings/analytics";

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
        Members of this workspace have now been assigned a license. Please refer to the billing team to manage license,
        refer plan details, invoices, and more
      </p>
      <Row gutter={8} align="middle">
        <Col>
          <RQButton
            type="primary"
            onClick={() => {
              trackWorkspaceSettingsGoToBillingTeamClicked(teamDetails.id);
              if (billingId) {
                redirectToBillingTeam(navigate, billingId, window.location.pathname, "workspace-settings");
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
              trackWorkspaceSettingsLearnMoreClicked(teamDetails.id);
              redirectToUrl("https://docs.requestly.com/general/others/billing-subscriptions", true);
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
                trackWorkspaceSettingsAutomaticMappingToggleClicked(teamDetails.id, checked);
                if (checked) {
                  toast.success("Members will be automatically assigned a license.");
                } else {
                  toast.warn("Members will not be automatically assigned a license.");
                }
                setIsBillingTeamMapped(checked);
              })
              .catch(() => {
                setIsBillingTeamMapped(!checked);
                toast.error("Something went wrong. Please contact support.");
              });
          }}
          title="Automatically assign license to the members joinning this workspace"
          caption="Enable automatic inclusion in the billing team for members joining this workspace"
        />
      </Row>
      <Typography.Text className="billing-non-admin-message">
        Premium features will be enabled for the users who are assigned a license
      </Typography.Text>
    </div>
  ) : (
    <p className="billing-non-admin-message">Only admin can view the billing details.</p>
  );
};

export default BillingDetails;
