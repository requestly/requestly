import { PRODUCT_WALKTHROUGH } from "./constants";
import { trackEvent } from "modules/analytics";

export const trackWalkthroughViewed = () => {
  trackEvent(PRODUCT_WALKTHROUGH.WALKTHROUGH_VIEWED);
};

export const trackWalkthroughStepCompleted = (
  step: number,
  rule_type: string
) => {
  const params = { step, rule_type };
  trackEvent(PRODUCT_WALKTHROUGH.WALKTHROUGH_STEP_DONE, params);
};

export const trackWalkthroughCompleted = () => {
  trackEvent(PRODUCT_WALKTHROUGH.WALKTHROUGH_COMPLETED);
};
