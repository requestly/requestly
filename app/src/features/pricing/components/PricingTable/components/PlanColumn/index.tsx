import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import { Col, Row, Space, Tooltip, Typography } from "antd";
import { PricingTableButtons } from "../../PricingTableButtons";
import { CloseOutlined } from "@ant-design/icons";
import { capitalize, kebabCase } from "lodash";
import { PRICING } from "features/pricing/constants/pricing";
import { PricingPlans } from "features/pricing/constants/pricingPlans";
import { trackPricingPlansQuantityChanged } from "features/pricing/analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { PlanQuantitySelector } from "../PlanQuantitySelector/PlanQuantitySelector";
import { shouldShowNewCheckoutFlow } from "features/pricing/utils";
import { useFeatureIsOn, useFeatureValue } from "@growthbook/growthbook-react";
import { useIsBrowserStackIntegrationOn } from "hooks/useIsBrowserStackIntegrationOn";

interface PlanColumnProps {
  planName: string;
  planDetails: any;
  planPrice: number;
  duration: string;
  product?: string;
  source: string;
  isOpenedFromModal: boolean;
}

export const PlanColumn: React.FC<PlanColumnProps> = ({
  planName,
  planDetails,
  planPrice,
  duration,
  product,
  source,
  isOpenedFromModal,
}) => {
  const user = useSelector(getUserAuthDetails);
  const [quantity, setQuantity] = useState(1);
  const [disbaleUpgradeButton, setDisbaleUpgradeButton] = useState(false);
  const hasFiddledWithQuantity = useRef(false);

  const isBrowserstackIntegrationOn = useIsBrowserStackIntegrationOn();
  const isBrowserstackCheckoutEnabled = useFeatureValue("browserstack_checkout", true);

  const currentSeats = user.details?.planDetails?.subscription?.quantity ?? 1;

  const isNewCheckoutFlowEnabled = useMemo(
    () => shouldShowNewCheckoutFlow(isBrowserstackIntegrationOn, isBrowserstackCheckoutEnabled),
    [isBrowserstackIntegrationOn, isBrowserstackCheckoutEnabled]
  );

  useEffect(() => {
    //is user logs out set quantity to 1, it will reset the pricing according to 1
    if (!user.loggedIn) {
      setQuantity(1);
    }
  }, [user.loggedIn]);

  const getPreviousPlanName = () => {
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

    if (planName === PRICING.PLAN_NAMES.API_CLIENT_PROFESSIONAL) {
      return capitalize(PRICING.PLAN_NAMES.FREE);
    }

    const index = pricingPlansOrder.indexOf(planName);
    return capitalize(pricingPlansOrder[index - 1]);
  };

  const renderFeaturesListHeader = (planName: string, heading: string) => {
    return (
      <Row className={`pro-basic-feature-title text-left ${kebabCase(product)}`}>
        {product === PRICING.PRODUCTS.API_CLIENT ? (
          <Col>
            <span>{heading}</span>
          </Col>
        ) : (
          <>
            {planName === PRICING.PLAN_NAMES.FREE && (
              <Col>
                <span>
                  All you need
                  <img src={"/assets/media/common/yellow-highlight.svg"} alt="highlight" />
                </span>{" "}
                to get started
              </Col>
            )}
            {planName !== PRICING.PLAN_NAMES.FREE && (
              <Col>
                <span>
                  Everything <img src={"/assets/media/common/yellow-highlight.svg"} alt="highlight" />
                </span>{" "}
                in {getPreviousPlanName()} plan +
              </Col>
            )}
          </>
        )}
      </Row>
    );
  };

  const getPricingPlanAnnualBillingSubtitle = (planName: string) => {
    if (planName === PRICING.PLAN_NAMES.LITE && duration === PRICING.DURATION.MONTHLY) {
      return `Billed $${PricingPlans[planName]?.plans[PRICING.DURATION.ANNUALLY]?.usd?.price * quantity} annually`;
    }
    if (
      planName === PRICING.PLAN_NAMES.BASIC ||
      planName === PRICING.PLAN_NAMES.PROFESSIONAL ||
      planName === PRICING.PLAN_NAMES.LITE ||
      planName === PRICING.PLAN_NAMES.API_CLIENT_PROFESSIONAL
    )
      return `Billed $${PricingPlans[planName]?.plans[duration]?.usd?.price * quantity} annually`;
    return null;
  };

  const planCardSubtitle = getPricingPlanAnnualBillingSubtitle(planName);

  const EVENTS = {
    PRICING_QUANTITY_CHANGED: "pricing_quantity_changed",
  };

  function debounce(func: Function, delay: number) {
    let timer: NodeJS.Timeout;
    return function debouncedFunction(...args: any[]) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  const sendNotification = useCallback(
    debounce((value: number) => {
      if (user.loggedIn) {
        const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
        try {
          salesInboundNotification({
            notificationText: `${EVENTS.PRICING_QUANTITY_CHANGED} triggered with quantity ${value} for plan ${planName} and source ${source}`,
          });
        } catch (error) {
          console.error(error);
        }
      }
    }, 4000),
    [planName, source, user.loggedIn]
  );

  const handleQuantityChange = useCallback(
    (value: number, skipNotification: boolean = false) => {
      if (value === Infinity) {
        setQuantity(value);
        return;
      }
      if (value < 1 || value > 1000) {
        setDisbaleUpgradeButton(true);
      } else setDisbaleUpgradeButton(false);
      setQuantity(value);
      trackPricingPlansQuantityChanged(value, planName, source);

      if (!hasFiddledWithQuantity.current && user.loggedIn) {
        const addToApolloSequence = httpsCallable(getFunctions(), "pricing-addToApolloPricingFiddleSequence");
        addToApolloSequence().catch((error) => {
          Logger.log("Error adding user to apollo sequence", error);
        });
        hasFiddledWithQuantity.current = true;
      }
      if (!skipNotification) {
        sendNotification(value);
      }
    },
    [sendNotification, planName, source, user.loggedIn]
  );

  const cardSubtitle = <>{planCardSubtitle ? <Typography.Text>{planCardSubtitle}</Typography.Text> : null}</>;

  return (
    <Col
      key={planName}
      className={`plan-card ${planName === PRICING.PLAN_NAMES.PROFESSIONAL ? "recommended-plan-card" : ""} ${
        planName === PRICING.PLAN_NAMES.LITE && duration === PRICING.DURATION.MONTHLY ? "disabled-col" : ""
      }`}
    >
      {planName === user.details?.planDetails?.planName ? (
        <div className="plan-card-current-header">
          {user?.details?.planDetails?.status === "trialing" ? (
            "TRIAL"
          ) : (
            <>
              CURRENT PLAN{" "}
              {planName === PRICING.PLAN_NAMES.BASIC || planName === PRICING.PLAN_NAMES.PROFESSIONAL
                ? `- ${user.details?.planDetails?.subscription?.quantity} SEATS`
                : ""}
            </>
          )}
        </div>
      ) : null}
      <div className="plan-card-middle-section">
        <Space size={8}>
          <Typography.Text className="plan-name">
            {capitalize(planDetails.planTitle)}
            {planName === PRICING.PLAN_NAMES.LITE
              ? " - For individuals"
              : planName === PRICING.PLAN_NAMES.BASIC
              ? " - Small teams"
              : ""}
          </Typography.Text>
          {planName === PRICING.PLAN_NAMES.PROFESSIONAL && <span className="recommended-tag">MOST VALUE</span>}
        </Space>
        {planName === PRICING.PLAN_NAMES.ENTERPRISE && (
          <Row align="middle" className="items-center plan-price-row mt-8">
            <Space size={0}>
              <div className="plan-price enterprise-pricing-container">
                <span className="text-bold">Starts at</span>
                <div className="enterprise-pricing-details">
                  <Typography.Text className="plan-price enterprice-plan-price">$59</Typography.Text>
                  <div className="plan-price caption">
                    <Typography.Text>member / month</Typography.Text>
                  </div>
                </div>
              </div>
            </Space>
          </Row>
        )}
        {planPrice !== undefined && (
          <Row align="middle" className="items-center plan-price-row">
            <>
              {quantity === Infinity ? (
                <Space direction="vertical">
                  <Typography.Title level={3} style={{ marginBottom: 0 }}>
                    Large team?
                  </Typography.Title>
                  <Typography.Text>Get in touch with us</Typography.Text>
                </Space>
              ) : (
                <Space size="small">
                  <Typography.Text className="plan-price">
                    ${(duration === PRICING.DURATION.ANNUALLY ? Math.ceil(planPrice / 12) : planPrice) * quantity}
                  </Typography.Text>
                  <div className="caption text-white">/ month</div>
                </Space>
              )}
            </>
          </Row>
        )}
        {planPrice !== undefined && (
          <Row align="middle" className="quantity-container">
            <>
              {((product === PRICING.PRODUCTS.HTTP_RULES &&
                planName !== PRICING.PLAN_NAMES.FREE &&
                planName !== PRICING.PLAN_NAMES.ENTERPRISE &&
                planName !== PRICING.PLAN_NAMES.LITE) ||
                (product === PRICING.PRODUCTS.API_CLIENT &&
                  planName === PRICING.PLAN_NAMES.API_CLIENT_PROFESSIONAL)) && (
                <PlanQuantitySelector
                  columnPlanName={planName}
                  currentPlanName={user.details?.planDetails?.planName}
                  currentSeats={currentSeats}
                  isNewCheckoutFlowEnabled={isNewCheckoutFlowEnabled}
                  quantity={quantity}
                  handleQuantityChange={handleQuantityChange}
                />
              )}
            </>
          </Row>
        )}
        {planDetails?.planDescription && (
          <Row>
            <Typography.Text type="secondary" className="plan-description">
              {planDetails.planDescription}
            </Typography.Text>
          </Row>
        )}
        <Row className="annual-bill mt-8" style={{ display: "flex", minHeight: "17px" }}>
          {quantity !== Infinity ? (
            <>
              {duration === PRICING.DURATION.MONTHLY ? (
                planName === PRICING.PLAN_NAMES.LITE ? (
                  cardSubtitle
                ) : (
                  <Typography.Text>Billed monthly</Typography.Text>
                )
              ) : (
                cardSubtitle
              )}
            </>
          ) : null}
        </Row>
        <Row
          style={{
            marginTop: "24px",
            minHeight: "30px",
          }}
        >
          <PricingTableButtons
            key={planName + duration}
            columnPlanName={planName}
            product={product}
            duration={duration}
            source={source}
            quantity={quantity}
            disabled={disbaleUpgradeButton}
            isNewCheckoutFlowEnabled={isNewCheckoutFlowEnabled}
          />
        </Row>
      </div>

      <div className="plan-card-details">
        <>{renderFeaturesListHeader(planName, planDetails.heading)}</>
        <Space direction="vertical" className="plan-features-list">
          {planDetails.features.map((feature: any, index: number) => {
            if (isOpenedFromModal && feature.visibleInPricingPageOnly) return null;
            return (
              <div className={`text-left plan-feature-item ${feature.tooltip ? "underlined" : ""}`} key={index}>
                {feature.enabled ? <img src={"/assets/media/common/check.svg"} alt="check" /> : <CloseOutlined />}{" "}
                <Tooltip title={feature?.tooltip} color="var(--requestly-color-black)">
                  <span className={`${feature?.tooltip ? "plan-feature-underline" : ""}`}>{feature.title}</span>
                </Tooltip>
              </div>
            );
          })}
        </Space>
      </div>
    </Col>
  );
};
