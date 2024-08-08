import { trackEvent } from "modules/analytics";
import { BUSINESS } from "../../constants";

export const trackCheckoutButtonClicked = (duration, plan, quantity, isTrialUser, source) => {
  const params = { duration, plan, quantity, source, is_user_on_trial: isTrialUser };
  trackEvent(BUSINESS.CHECKOUT.BUTTON_CLICKED, params);
};

export const trackCheckoutFailedEvent = (quantity, source) => {
  trackEvent(BUSINESS.CHECKOUT.FAILED, { quantity, source });
};

export const trackEnterpriseRequestEvent = (company) => {
  const params = { company };
  trackEvent(BUSINESS.CHECKOUT.ENTERPRISE_REQUESTED, params);
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

export const trackCheckoutCompleted = (is_user_on_trial = false) => {
  const params = { is_user_on_trial };

  trackEvent(BUSINESS.CHECKOUT.CHECKOUT_COMPLETED, params);
};
