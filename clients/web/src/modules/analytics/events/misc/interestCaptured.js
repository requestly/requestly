import { trackEvent } from "modules/analytics";
import { INTEREST_CAPTURED, DESKTOP_ACTION_INTEREST_CAPTURED } from "./constants";

export const interestCaptured = (feature) => {
  const params = {
    feature,
  };
  trackEvent(INTEREST_CAPTURED, params);
};

export const trackDesktopActionInterestCaptured = (rule_type) => {
  const params = { rule_type };
  trackEvent(DESKTOP_ACTION_INTEREST_CAPTURED, params);
};
