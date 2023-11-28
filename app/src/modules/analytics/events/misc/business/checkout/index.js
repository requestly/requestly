import { trackEvent } from "modules/analytics";
import { BUSINESS } from "../../constants";

export const trackCheckoutInitiatedEvent = (duration, plan, quantity, isTrialUser, source) => {
  const params = { duration, plan, quantity, source, is_user_on_trial: isTrialUser };
  trackEvent(BUSINESS.CHECKOUT.INITIATED, params);
};

export const trackCheckoutFailedEvent = (type, source) => {
  trackEvent(BUSINESS.CHECKOUT.FAILED, { type, source });
};

export const trackCheckoutCompletedEvent = (source) => {
  trackEvent(BUSINESS.CHECKOUT.COMPLETED, { source });
};

export const trackEnterpriseRequestEvent = (company) => {
  const params = { company };
  trackEvent(BUSINESS.CHECKOUT.ENTERPRISE_REQUESTED, params);
};
