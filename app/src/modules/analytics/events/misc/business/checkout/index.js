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
