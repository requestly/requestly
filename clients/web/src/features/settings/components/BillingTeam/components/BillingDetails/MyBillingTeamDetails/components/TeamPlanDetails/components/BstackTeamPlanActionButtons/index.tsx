import React from "react";
import { Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { FaRegCreditCard } from "@react-icons/all-files/fa/FaRegCreditCard";
import { redirectToUrl } from "utils/RedirectionUtils";
import { trackBillingTeamManagePlanClicked } from "features/settings/analytics";

interface Props {
  subscriptionDetails: any;
}

export const BstackTeamPlanActionButtons: React.FC<Props> = ({ subscriptionDetails }) => {
  return (
    <>
      <Col className="team-plan-details-card-actions">
        <RQButton
          type="text"
          className=""
          icon={<FaRegCreditCard />}
          onClick={() => {
            trackBillingTeamManagePlanClicked();
            redirectToUrl(`${process.env.VITE_BROWSERSTACK_BASE_URL}/accounts/profile/overview`, true);
          }}
        >
          Manage Plan
        </RQButton>
      </Col>
    </>
  );
};
