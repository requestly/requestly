import React, { useState } from "react";
import { Col, InputNumber, Row, Space, Tooltip, Typography } from "antd";
import { PricingTableButtons } from "../../PricingTableButtons";
import { CloseOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import { PRICING } from "features/pricing/constants/pricing";
import { PricingPlans } from "features/pricing/constants/pricingPlans";
import underlineIcon from "features/pricing/assets/yellow-highlight.svg";
import checkIcon from "assets/img/icons/common/check.svg";
import { trackPricingPlansQuantityChanged } from "features/pricing/analytics";

interface PlanColumnProps {
  planName: string;
  planDetails: any;
  planPrice: number;
  duration: string;
  product?: string;
  source: string;
  isOpenedFromModal: boolean;
  setIsContactUsModalOpen: (value: boolean) => void;
}

export const PlanColumn: React.FC<PlanColumnProps> = ({
  planName,
  planDetails,
  planPrice,
  duration,
  product,
  source,
  isOpenedFromModal,
  setIsContactUsModalOpen,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [disbaleUpgradeButton, setDisbaleUpgradeButton] = useState(false);

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
    if (planName === PRICING.PLAN_NAMES.BASIC || planName === PRICING.PLAN_NAMES.PROFESSIONAL)
      return `Billed $${PricingPlans[planName]?.plans[duration]?.usd?.price * quantity} annually`;
    return null;
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1 || value > 1000) {
      setDisbaleUpgradeButton(true);
    } else setDisbaleUpgradeButton(false);
    setQuantity(value);
    trackPricingPlansQuantityChanged(value, planName, source);
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
      {planName === PRICING.PLAN_NAMES.ENTERPRISE && (
        <Row align="middle" className="items-center plan-price-row mt-8">
          <Space size={0}>
            <Typography.Text strong className="plan-price">
              $59
            </Typography.Text>
            <div className="caption">
              <Typography.Text>member / month</Typography.Text>
            </div>
          </Space>
        </Row>
      )}
      {planPrice !== undefined && (
        <Row align="middle" className="items-center plan-price-row mt-8">
          <Space size="small">
            <Typography.Text strong className="plan-price">
              ${(duration === PRICING.DURATION.ANNUALLY ? Math.ceil(planPrice / 12) : planPrice) * quantity}
            </Typography.Text>
            {product === PRICING.PRODUCTS.HTTP_RULES &&
              planName !== PRICING.PLAN_NAMES.FREE &&
              planName !== PRICING.PLAN_NAMES.ENTERPRISE && (
                <Space>
                  <InputNumber
                    style={{ width: "65px", height: "30px", display: "flex", alignItems: "center" }}
                    size="small"
                    type="number"
                    min={1}
                    max={1000}
                    maxLength={4}
                    defaultValue={1}
                    value={quantity}
                    onChange={(value: number) => {
                      handleQuantityChange(value);
                    }}
                  />
                </Space>
              )}
            <div className="caption">
              {planName !== PRICING.PLAN_NAMES.FREE && <Typography.Text>member / month</Typography.Text>}
            </div>
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
      <Row className="mt-8" style={{ display: getPricingPlanAnnualBillingSubtitle(planName) ? "flex" : "none" }}>
        <Typography.Text type="secondary">
          {duration === PRICING.DURATION.MONTHLY
            ? "Billed monthly"
            : getPricingPlanAnnualBillingSubtitle(planName) || ""}
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
          disabled={disbaleUpgradeButton}
        />
      </Row>
      <>{renderFeaturesListHeader(planName)}</>
      <Space direction="vertical" className="plan-features-list">
        {planDetails.features.map((feature: any, index: number) => {
          if (isOpenedFromModal && feature.visibleInPricingPageOnly) return null;
          return (
            <div className="text-left plan-feature-item" key={index}>
              {feature.enabled ? <img src={checkIcon} alt="check" /> : <CloseOutlined />}{" "}
              <Tooltip title={feature?.tooltip} color="var(--black)">
                <span className={`${feature?.tooltip ? "plan-feature-underline" : ""}`}>{feature.title}</span>
              </Tooltip>
            </div>
          );
        })}
      </Space>
    </Col>
  );
};
