import React from "react";
import { Alert, Typography, Button } from "antd";
import { getCurrencySymbol } from "../../../../utils/PricingUtils";
import { redirectToCheckout } from "../../../../utils/RedirectionUtils";
import APP_CONSTANTS from "../../../../config/constants";
import { trackCheckoutInitiatedEvent } from "modules/analytics/events/misc/business/checkout";

const { Text, Title } = Typography;

const LitePlanMessage = () => {
  return (
    <>
      <Title level={5}>We are also offering a Lite Plan for Limited Time Only </Title>
    </>
  );
};

const LitePlanDescription = ({ currency, price }) => {
  const checkoutLitePlan = () => {
    trackCheckoutInitiatedEvent("monthly", APP_CONSTANTS.PRICING.PLAN_NAMES.LITE, 1);
    redirectToCheckout({
      planType: APP_CONSTANTS.PRICING.PLAN_NAMES.LITE,
      mode: "individual",
      days: "30",
    });
  };

  return (
    <>
      <Text type="secondary">{"5 Rules, 3 Active Rules, 3 Rule Conditions, No Character Limits"}</Text>
      <br />
      <Text strong>
        <Button type="link" onClick={checkoutLitePlan}>
          Upgrade Now @ {getCurrencySymbol(null, currency)}
          {+price}/month
        </Button>
      </Text>
    </>
  );
};

const RepresentLitePlan = ({ price, currency }) => {
  return (
    <div>
      <Alert
        message={<LitePlanMessage />}
        type="info"
        showIcon
        description={<LitePlanDescription price={price} currency={currency} />}
        className="lite-plan-alert"
        style={{ borderRadius: "0.5rem" }}
      />
    </div>
  );
};

export default RepresentLitePlan;
