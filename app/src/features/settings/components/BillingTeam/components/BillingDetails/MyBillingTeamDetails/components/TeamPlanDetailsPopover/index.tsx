import React, { useMemo } from "react";
import { Col, Row } from "antd";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import { PricingFeatures } from "features/pricing";
import { PRICING } from "features/pricing";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
// import { PricingPlans } from "features/pricing";

interface Props {
  billingTeamDetails: BillingTeamDetails;
  closePopover: () => void;
  isAnnualPlan: boolean;
}

export const TeamPlanDetailsPopover: React.FC<Props> = ({ billingTeamDetails, closePopover, isAnnualPlan }) => {
  const planDetails = billingTeamDetails?.subscriptionDetails;

  const planName = useMemo(() => {
    return getPlanNameFromId(planDetails.plan) === "basic-v2" ? "basic" : getPlanNameFromId(planDetails.plan);
  }, [planDetails.plan]);

  // const planPrice =
  //   PricingPlans[planName]?.plans[isAnnualPlan ? PRICING.DURATION.ANNUALLY : PRICING.DURATION.MONTHLY]?.usd?.price;

  return (
    <>
      {/* <Col className="team-plan-popover-header">
        <IoMdClose className="team-plan-popover-close-icon" onClick={closePopover} />
        <Col className="text-bold text-white" style={{ display: "inline-block" }}>
          {getPrettyPlanName(getPlanNameFromId(planDetails.plan))} team plan
        </Col>
        <Row gutter={4} className="mt-8 items-center" align="middle">
          <Col className="header ">${isAnnualPlan ? planPrice / 12 : planPrice}</Col>
          <Col className="text-white caption">per member/ per month</Col>
        </Row>
        <Col className="mt-16">Billed {isAnnualPlan ? "annually" : "monthly"}</Col>
      </Col> */}
      <Col className="team-plan-popover-body">
        <Col className="text-white text-bold">What's included in your plan</Col>
        <Col>
          {PricingFeatures[planName.includes("api-client") ? PRICING.PRODUCTS.API_CLIENT : PRICING.PRODUCTS.HTTP_RULES][
            planName
          ].features.map((feature) => (
            <Row align="middle" className="team-plan-popover-feature">
              <MdCheck />
              <Col className="team-plan-popover-feature-name">{feature.title}</Col>
            </Row>
          ))}
        </Col>
      </Col>
      {!billingTeamDetails?.browserstackGroupId ? (
        <Col className="team-plan-popover-footer">
          <div className="team-plan-popover-footer-section">
            <Col>Plan start date</Col>
            <Col className="header">
              {getLongFormatDateString(new Date(planDetails.subscriptionCurrentPeriodStart * 1000))}
            </Col>
          </div>
          <div className="team-plan-popover-footer-section">
            <Col>Plan renewal date</Col>
            <Col className="header">
              {getLongFormatDateString(new Date(planDetails.subscriptionCurrentPeriodEnd * 1000))}
            </Col>
          </div>
        </Col>
      ) : null}
    </>
  );
};
