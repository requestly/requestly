import { trackEvent } from "modules/analytics";
import { BUSINESS } from "../../constants";

export const trackCheckoutInitiatedEvent = (duration, plan, quantity) => {
  const params = { duration, plan, quantity };
  trackEvent(BUSINESS.CHECKOUT.INITIATED, params);
};

export const trackCheckoutFailedEvent = () => {
  trackEvent(BUSINESS.CHECKOUT.FAILED);
};

export const trackCheckoutCompletedEvent = () => {
  trackEvent(BUSINESS.CHECKOUT.COMPLETED);
};

export const trackEnterpriseRequestEvent = (company) => {
  const params = { company };
  trackEvent(BUSINESS.CHECKOUT.ENTERPRISE_REQUESTED, params);
};
