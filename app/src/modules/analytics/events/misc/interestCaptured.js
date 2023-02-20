import { trackEvent } from "modules/analytics";
import { INTEREST_CAPTURED } from "./constants";

export const interestCaptured = (feature) => {
  const params = {
    feature,
  };
  trackEvent(INTEREST_CAPTURED, params);
};
