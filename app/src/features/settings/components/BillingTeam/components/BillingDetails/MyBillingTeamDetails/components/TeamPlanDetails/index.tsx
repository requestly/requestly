import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getBillingTeamMemberById } from "store/features/billing/selectors";
import { Badge, Col, Popover, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { TeamPlanStatus } from "../../../../TeamPlanStatus";
import { TeamPlanDetailsPopover } from "../TeamPlanDetailsPopover";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { BillingTeamDetails, BillingTeamRoles } from "features/settings/components/BillingTeam/types";
import { MdOutlinePreview } from "@react-icons/all-files/md/MdOutlinePreview";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { trackBillingTeamActionClicked } from "features/settings/analytics";
import "./index.scss";
import { TeamPlanActionButtons } from "./components/TeamPlanActionButtons";
import { globalActions } from "store/slices/global/slice";

const FreeTeamDetails: React.FC<{
  isUserManager?: boolean;
}> = ({ isUserManager }) => {
  const dispatch = useDispatch();

  return (
    <>
      <Col className="billing-teams-primary-card team-plan-details-card">
        <Row className="team-plan-details-card-header" justify="space-between" align="middle">
          <Col className="text-white text-bold display-flex items-center" style={{ gap: "8px" }}>
            Your Plan <Badge count="Free" status="default" />
          </Col>
          {isUserManager && (
            <RQButton
              type="primary"
              onClick={() => {
                dispatch(
                  globalActions.toggleActiveModal({
                    modalName: "pricingModal",
                    newValue: true,
                    newProps: { selectedPlan: null, source: "billing_team" },
                  })
                );
              }}
              icon={<img src={"/assets/media/settings/upgrade.svg"} alt="upgrade" />}
            >
              Buy plan
            </RQButton>
          )}
        </Row>
      </Col>
    </>
  );
};

export const TeamPlanDetails: React.FC<{ billingTeamDetails: BillingTeamDetails }> = ({ billingTeamDetails }) => {
  const user = useSelector(getUserAuthDetails);
  const teamOwnerDetails = useSelector(getBillingTeamMemberById(billingTeamDetails.id, billingTeamDetails.owner));
  const [isPlanDetailsPopoverVisible, setIsPlanDetailsPopoverVisible] = useState(false);

  const isUserManager = billingTeamDetails.members?.[user?.details?.profile?.uid]?.role !== BillingTeamRoles.Member;

  const isAnnualPlan = useMemo(() => {
    const startDate = new Date(billingTeamDetails?.subscriptionDetails?.subscriptionCurrentPeriodStart * 1000);
    const renewalDate = new Date(billingTeamDetails?.subscriptionDetails?.subscriptionCurrentPeriodEnd * 1000);
    // Calculate the difference in months
    const monthsDiff =
      (renewalDate.getFullYear() - startDate.getFullYear()) * 12 + (renewalDate.getMonth() - startDate.getMonth());
    return monthsDiff > 1;
  }, [
    billingTeamDetails?.subscriptionDetails?.subscriptionCurrentPeriodEnd,
    billingTeamDetails?.subscriptionDetails?.subscriptionCurrentPeriodStart,
  ]);

  // No active plan case
  if (!billingTeamDetails.subscriptionDetails) {
    return <FreeTeamDetails isUserManager={isUserManager} />;
  }

  return (
    <>
      <Col className="billing-teams-primary-card team-plan-details-card">
        <Row className="team-plan-details-card-header" justify="space-between" align="middle">
          <Col className="text-white text-bold display-flex items-center" style={{ gap: "8px" }}>
            Your Plan{" "}
            <TeamPlanStatus
              subscriptionStatus={billingTeamDetails?.subscriptionDetails?.subscriptionStatus}
              subscriptionEndDate={billingTeamDetails?.subscriptionDetails?.subscriptionCurrentPeriodEnd * 1000}
              cancelAtPeriodEnd={billingTeamDetails?.subscriptionDetails?.cancel_at_period_end}
            />
          </Col>
          {isUserManager && (
            <TeamPlanActionButtons
              subscriptionDetails={billingTeamDetails?.subscriptionDetails}
              isAnnualPlan={isAnnualPlan}
            />
          )}
        </Row>
        <div className="team-plan-details-sections-wrapper">
          <div className="team-plan-details-section">
            <Row align="middle" gutter={8}>
              <Col className="team-plan-details-section-plan-name">
                {getPrettyPlanName(getPlanNameFromId(billingTeamDetails?.subscriptionDetails?.plan))} team plan
              </Col>
              <Col>
                <Popover
                  content={
                    <TeamPlanDetailsPopover
                      planDetails={billingTeamDetails?.subscriptionDetails}
                      closePopover={() => setIsPlanDetailsPopoverVisible(false)}
                      isAnnualPlan={isAnnualPlan}
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
                    onClick={() => {
                      setIsPlanDetailsPopoverVisible(true);
                      trackBillingTeamActionClicked("view_plan_details");
                    }}
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
              Billed {isAnnualPlan ? "annually" : "monthly"}
            </Col>
            <Row align="middle" gutter={4} className="mt-8">
              <Col className="header">{billingTeamDetails?.subscriptionDetails?.quantity}</Col>
              <Col className="text-white caption">Licences</Col>
            </Row>
          </div>
          <div className="team-plan-details-section">
            <Col className="team-plan-details-section__team-name">{billingTeamDetails.name}</Col>
            <div className="team-plan-details-section__team-details">
              <Col>
                <div className="team-plan-details-section-label">
                  {billingTeamDetails?.isAcceleratorTeam ? "Admin" : "Billing manager"}
                </div>
                <div className="text-white">{teamOwnerDetails?.displayName ?? "User"}</div>
              </Col>
              <Col>
                <div className="team-plan-details-section-label">
                  {billingTeamDetails?.isAcceleratorTeam ? "Admin" : "Billing"} email
                </div>
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
                {getLongFormatDateString(
                  new Date(billingTeamDetails?.subscriptionDetails?.subscriptionCurrentPeriodEnd * 1000)
                )}
              </Col>
            </div>
          </div>
        </div>
      </Col>
    </>
  );
};
