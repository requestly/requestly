import { trackEvent } from "modules/analytics";
import { BUSINESS } from "../../constants";

export const trackCheckoutFailedEvent = (quantity, source, transaction_source) => {
  trackEvent(BUSINESS.CHECKOUT.FAILED, { quantity, source, transaction_source });
};

export const trackEnterpriseRequestEvent = (company) => {
  const params = { company };
  trackEvent(BUSINESS.CHECKOUT.ENTERPRISE_REQUESTED, params);
};

export const trackBStackStripeCheckoutInitiated = () => {
  trackEvent(BUSINESS.CHECKOUT.BSTACK_STRIPE_CHECKOUT_INITIATED);
};

export const trackCheckoutInitiated = ({
  plan_name,
  duration,
  currency,
  quantity,
  is_user_on_trial = false,
  source,
}) => {
  const params = {
    plan_name,
    duration,
    currency,
    quantity,
    is_user_on_trial,
    source,
  };

  trackEvent(BUSINESS.CHECKOUT.CHECKOUT_INITIATIED, params);
};

export const trackCheckoutCompleted = (transaction_source, is_user_on_trial = false) => {
  const params = { transaction_source, is_user_on_trial };

  trackEvent(BUSINESS.CHECKOUT.CHECKOUT_COMPLETED, params);
};

export const trackUpgradeToAnnualRouteOpened = (params) => {
  trackEvent("upgrade_to_annual_route_opened", params);
};
