import React from "react";
import { Col, Row } from "antd";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import { PricingFeatures } from "features/pricing";
import { PRICING } from "features/pricing";

interface Props {
  planDetails: Record<string, any>;
  closePopover: () => void;
}

export const TeamPlanDetailsPopover: React.FC<Props> = ({ planDetails, closePopover }) => {
  return (
    <>
      <Col className="team-plan-popover-header">
        <Col className="text-bold text-white">{getPrettyPlanName(getPlanNameFromId(planDetails.plan))} team plan</Col>
        <IoMdClose className="team-plan-popover-close-icon" onClick={closePopover} />
      </Col>
      <Col className="team-plan-popover-body">
        <Col className="text-white text-bold">What's included in your plan</Col>
        <Col>
          {PricingFeatures[PRICING.PRODUCTS.HTTP_RULES][getPlanNameFromId(planDetails.plan)].features.map((feature) => (
            <Row align="middle" className="team-plan-popover-feature">
              <MdCheck />
              <Col className="team-plan-popover-feature-name">{feature.title}</Col>
            </Row>
          ))}
        </Col>
      </Col>
      <Col className="team-plan-popover-footer">
        <div className="team-plan-popover-footer-section">
          <Col>Plan start date</Col>
          <Col className="header">
            {new Date(planDetails.subscriptionCurrentPeriodStart * 1000).toLocaleString("default", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Col>
        </div>
        <div className="team-plan-popover-footer-section">
          <Col>Plan renewal date</Col>
          <Col className="header">
            {new Date(planDetails.subscriptionCurrentPeriodEnd * 1000).toLocaleString("default", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Col>
        </div>
      </Col>
    </>
  );
};
