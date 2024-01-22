import React, { useState } from "react";
import { Col, InputNumber, Row, Space, Tooltip, Typography } from "antd";
import { PricingTableButtons } from "../../PricingTableButtons";
import { CloseOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import { PRICING } from "features/pricing/constants/pricing";
import { PricingPlans } from "features/pricing/constants/pricingPlans";
import underlineIcon from "../../../../assets/yellow-highlight.svg";
import checkIcon from "assets/img/icons/common/check.svg";

interface PlanColumnProps {
  planName: string;
  planDetails: any;
  planPrice: number;
  duration: string;
  product?: string;
  source: string;
  setIsContactUsModalOpen: (value: boolean) => void;
}

export const PlanColumn: React.FC<PlanColumnProps> = ({
  planName,
  planDetails,
  planPrice,
  duration,
  product,
  source,
  setIsContactUsModalOpen,
}) => {
  const [quantity, setQuantity] = useState(1);
  const renderFeaturesListHeader = (planName: string) => {
    return (
      <Row className="pro-basic-feature-title text-left">
        {planName === PRICING.PLAN_NAMES.FREE && (
          <Col>
            <span>
              All you need
              <img src={underlineIcon} alt="highlight" />
            </span>{" "}
            to get started
          </Col>
        )}
        {planName !== PRICING.PLAN_NAMES.FREE && (
          <Col>
            <span>
              Everything <img src={underlineIcon} alt="highlight" />
            </span>{" "}
            in{" "}
            {planName === PRICING.PLAN_NAMES.BASIC || product === PRICING.PRODUCTS.SESSION_REPLAY
              ? capitalize(PRICING.PLAN_NAMES.FREE)
              : planName === PRICING.PLAN_NAMES.PROFESSIONAL
              ? capitalize(PRICING.PLAN_NAMES.BASIC)
              : capitalize(PRICING.PLAN_NAMES.PROFESSIONAL)}{" "}
            plan, and
          </Col>
        )}
      </Row>
    );
  };

  const getPricingPlanAnnualBillingSubtitle = (planName: string) => {
    switch (planName) {
      case PRICING.PLAN_NAMES.BASIC:
        return `Billed $${PricingPlans[planName]?.plans[duration]?.usd?.price} annually`;
      case PRICING.PLAN_NAMES.PROFESSIONAL:
        return `Billed $${PricingPlans[planName]?.plans[duration]?.usd?.price} annually`;
      default:
        return "";
    }
  };
  return (
    <Col
      key={planName}
      className={`plan-card ${planName === PRICING.PLAN_NAMES.PROFESSIONAL ? "recommended-plan-card" : ""}`}
    >
      <Space size={8}>
        <Typography.Text className="plan-name">{capitalize(planDetails.planTitle)}</Typography.Text>
        {planName === PRICING.PLAN_NAMES.PROFESSIONAL && <span className="recommended-tag">RECOMMENDED</span>}
      </Space>
      {planPrice !== undefined && (
        <Row align="middle" className="items-center">
          <Space size="small">
            <Typography.Text strong className="plan-price">
              ${duration === PRICING.DURATION.ANNUALLY ? planPrice / 12 : planPrice}
            </Typography.Text>
            {product === PRICING.PRODUCTS.HTTP_RULES &&
              planName !== PRICING.PLAN_NAMES.FREE &&
              planName !== PRICING.PLAN_NAMES.ENTERPRISE && (
                <Space>
                  <InputNumber
                    style={{ width: "55px", height: "30px", display: "flex", alignItems: "center" }}
                    size="small"
                    min={1}
                    defaultValue={1}
                    value={quantity}
                    onChange={(value) => setQuantity(value)}
                  />
                </Space>
              )}

            <div>{planName !== PRICING.PLAN_NAMES.FREE && <Typography.Text>member / month</Typography.Text>}</div>
          </Space>
        </Row>
      )}
      {planDetails?.planDescription && (
        <Row>
          <Typography.Text type="secondary" className="plan-description">
            {planDetails.planDescription}
          </Typography.Text>
        </Row>
      )}
      <Row className={`mt-8 ${getPricingPlanAnnualBillingSubtitle(planName) ? "" : "visibility-hidden"}`}>
        <Typography.Text type="secondary">
          {duration === PRICING.DURATION.MONTHLY
            ? "Billed monthly"
            : getPricingPlanAnnualBillingSubtitle(planName) || "dummy"}
        </Typography.Text>
      </Row>
      <Row className="mt-16">
        <PricingTableButtons
          key={planName + duration}
          columnPlanName={planName}
          product={product}
          duration={duration}
          source={source}
          quantity={quantity}
          setIsContactUsModalOpen={setIsContactUsModalOpen}
        />
      </Row>
      <>{renderFeaturesListHeader(planName)}</>
      <Space direction="vertical" className="plan-features-list">
        {planDetails.features.map((feature: any, index: number) => (
          <div className="text-left plan-feature-item" key={index}>
            {feature.enabled ? <img src={checkIcon} alt="check" /> : <CloseOutlined />}{" "}
            <Tooltip title={feature?.tooltip} color="var(--black)">
              <span className={`${feature?.tooltip ? "plan-feature-underline" : ""}`}>{feature.title}</span>
            </Tooltip>
          </div>
        ))}
      </Space>
    </Col>
  );
};
