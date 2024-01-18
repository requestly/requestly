import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getBillingTeamMemberById } from "store/features/billing/selectors";
import { Col, Popover, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { TeamPlanStatus } from "../../../TeamPlanStatus";
import { TeamPlanDetailsPopover } from "../TeamPlanDetailsPopover";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { MdOutlineCancel } from "@react-icons/all-files/md/MdOutlineCancel";
import { MdOutlinePreview } from "@react-icons/all-files/md/MdOutlinePreview";
import UpgradeIcon from "../../../../assets/upgrade.svg";
import "./index.scss";

export const TeamPlanDetails: React.FC<{ billingTeamDetails: BillingTeamDetails }> = ({ billingTeamDetails }) => {
  const teamOwnerDetails = useSelector(getBillingTeamMemberById(billingTeamDetails.id, billingTeamDetails.owner));

  const [isPlanDetailsPopoverVisible, setIsPlanDetailsPopoverVisible] = useState(false);

  return (
    <Col className="billing-teams-primary-card team-plan-details-card">
      <Row className="team-plan-details-card-header" justify="space-between" align="middle">
        <Col className="text-white text-bold display-flex items-center" style={{ gap: "8px" }}>
          Your Plan <TeamPlanStatus subscriptionStatus={billingTeamDetails.subscriptionDetails.subscriptionStatus} />
        </Col>
        <Col className="team-plan-details-card-actions">
          <RQButton type="text" className="team-plan-details-card-actions-cancel" icon={<MdOutlineCancel />}>
            Cancel plan
          </RQButton>
          <RQButton type="primary" icon={<img src={UpgradeIcon} alt="upgrade" />}>
            Upgrade plan
          </RQButton>
        </Col>
      </Row>
      <div className="team-plan-details-sections-wrapper">
        <div className="team-plan-details-section">
          <Row align="middle" gutter={8}>
            <Col className="team-plan-details-section-plan-name">
              {getPrettyPlanName(getPlanNameFromId(billingTeamDetails.subscriptionDetails.plan))} team plan
            </Col>
            <Col>
              <Popover
                content={
                  <TeamPlanDetailsPopover
                    planDetails={billingTeamDetails.subscriptionDetails}
                    closePopover={() => setIsPlanDetailsPopoverVisible(false)}
                  />
                }
                title={null}
                trigger="click"
                placement="bottomLeft"
                overlayClassName="team-plan-details-popover"
                showArrow={false}
                open={isPlanDetailsPopoverVisible}
                color="var(--surface-1)"
                onOpenChange={(open) => setIsPlanDetailsPopoverVisible(open)}
              >
                <RQButton
                  size="small"
                  type="text"
                  icon={<MdOutlinePreview />}
                  className="team-plan-details-btn"
                  onClick={() => setIsPlanDetailsPopoverVisible(true)}
                >
                  Plan details
                </RQButton>
              </Popover>
            </Col>
          </Row>
          <Col
            className="mt-8"
            style={{
              color: "var(--neutrals-gray-300)",
            }}
          >
            Billed monthly
          </Col>
          <Row align="middle" gutter={4} className="mt-8">
            <Col className="header">{billingTeamDetails.seats}</Col>
            <Col className="text-white caption">Licences</Col>
          </Row>
        </div>
        <div className="team-plan-details-section">
          <Col className="team-plan-details-section__team-name">{billingTeamDetails.name}</Col>
          <div className="team-plan-details-section__team-details">
            <Col>
              <div className="team-plan-details-section-label">Billing manager</div>
              <div className="text-white">{teamOwnerDetails?.displayName}</div>
            </Col>
            <Col>
              <div className="team-plan-details-section-label">Email</div>
              <div className="text-white">{teamOwnerDetails?.email}</div>
            </Col>
            {billingTeamDetails.description ? (
              <Col>
                <div className="team-plan-details-section-label">Description</div>
                <div className="text-white">{billingTeamDetails.description}</div>
              </Col>
            ) : null}
          </div>
        </div>
        <div className="team-plan-details-section display-row-center items-center">
          <div>
            <Col className="text-center caption">Plan renewal date</Col>
            <Col className="mt-8 text-center text-bold header">
              {new Date(
                billingTeamDetails.subscriptionDetails.subscriptionCurrentPeriodEnd * 1000
              ).toLocaleString("default", { month: "short", day: "numeric", year: "numeric" })}
            </Col>
          </div>
        </div>
      </div>
    </Col>
  );
};
