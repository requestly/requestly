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
import { getFunctions, httpsCallable } from "firebase/functions";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";

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
  const user = useSelector(getUserAuthDetails);

  const getHeaderPlanName = () => {
    const pricingPlansOrder = [
      PRICING.PLAN_NAMES.FREE,
      PRICING.PLAN_NAMES.LITE,
      PRICING.PLAN_NAMES.BASIC,
      PRICING.PLAN_NAMES.PROFESSIONAL,
      PRICING.PLAN_NAMES.ENTERPRISE,
    ];

    if (planName === PRICING.PLAN_NAMES.FREE) {
      return null;
    }

    if (product === PRICING.PRODUCTS.SESSION_REPLAY) {
      return capitalize(PRICING.PLAN_NAMES.FREE);
    }

    const index = pricingPlansOrder.indexOf(planName);
    return capitalize(pricingPlansOrder[index - 1]);
  };

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
            in {getHeaderPlanName()} plan +
          </Col>
        )}
      </Row>
    );
  };

  const getPricingPlanAnnualBillingSubtitle = (planName: string) => {
    if (
      planName === PRICING.PLAN_NAMES.BASIC ||
      planName === PRICING.PLAN_NAMES.PROFESSIONAL ||
      planName === PRICING.PLAN_NAMES.LITE
    )
      return `Billed $${PricingPlans[planName]?.plans[duration]?.usd?.price * quantity} annually`;
    return null;
  };

  const EVENTS = {
    PRICING_QUANTITY_CHANGED: "pricing_quantity_changed",
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1 || value > 1000) {
      setDisbaleUpgradeButton(true);
    } else setDisbaleUpgradeButton(false);
    setQuantity(value);
    trackPricingPlansQuantityChanged(value, planName, source);

    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
    try {
      salesInboundNotification({
        notificationText: `${
          EVENTS.PRICING_QUANTITY_CHANGED
        } trigged with quantity ${value} for plan ${planName} and source ${source} by user ${
          user?.details?.profile?.email ?? "NOT LOGGED IN"
        }`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Col
      key={planName}
      className={`plan-card ${planName === PRICING.PLAN_NAMES.PROFESSIONAL ? "recommended-plan-card" : ""}`}
    >
      <Space size={8}>
        <Typography.Text className="plan-name">{capitalize(planDetails.planTitle)}</Typography.Text>
        {planName === PRICING.PLAN_NAMES.PROFESSIONAL && <span className="recommended-tag">MOST VALUE</span>}
      </Space>
      {planName === PRICING.PLAN_NAMES.ENTERPRISE && (
        <Row align="middle" className="items-center plan-price-row mt-8">
          <Space size={0}>
            <span className="text-bold">Starts at</span>{" "}
            <Typography.Text className="plan-price enterprice-plan-price">$59</Typography.Text>
            <div className="caption">
              <Typography.Text>member per month</Typography.Text>
            </div>
          </Space>
        </Row>
      )}
      {planPrice !== undefined && (
        <Row align="middle" className="items-center plan-price-row mt-8">
          <Space size="small">
            <Typography.Text className="plan-price">
              ${(duration === PRICING.DURATION.ANNUALLY ? Math.ceil(planPrice / 12) : planPrice) * quantity}
            </Typography.Text>
            {product === PRICING.PRODUCTS.HTTP_RULES &&
              planName !== PRICING.PLAN_NAMES.FREE &&
              planName !== PRICING.PLAN_NAMES.ENTERPRISE &&
              planName !== PRICING.PLAN_NAMES.LITE && (
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
            <div className="caption text-white">
              {planName !== PRICING.PLAN_NAMES.FREE && (
                <div>{planName === PRICING.PLAN_NAMES.LITE ? "per month" : "member per month"}</div>
              )}
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
      <Row
        style={{
          marginTop: planName === PRICING.PLAN_NAMES.FREE ? "54px" : "24px",
        }}
      >
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
