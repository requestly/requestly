import { trackEvent } from "modules/analytics";
import { BUSINESS } from "../../constants";

export const trackCheckoutInitiatedEvent = (duration, plan, quantity, isTrialUser) => {
  const params = { duration, plan, quantity, is_user_on_trial: isTrialUser };
  trackEvent(BUSINESS.CHECKOUT.INITIATED, params);
};

export const trackCheckoutFailedEvent = (type) => {
  trackEvent(BUSINESS.CHECKOUT.FAILED, { type });
};

export const trackCheckoutCompletedEvent = () => {
  trackEvent(BUSINESS.CHECKOUT.COMPLETED);
};

export const trackEnterpriseRequestEvent = (company) => {
  const params = { company };
  trackEvent(BUSINESS.CHECKOUT.ENTERPRISE_REQUESTED, params);
};
