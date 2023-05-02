import { PRODUCT_WALKTHROUGH } from "./constants";
import { trackEvent } from "modules/analytics";

export const trackWalkthroughViewed = (tour: string) => {
  const params = { tour };
  trackEvent(PRODUCT_WALKTHROUGH.WALKTHROUGH_VIEWED, params);
};

export const trackWalkthroughStepCompleted = (step: number, tour: string) => {
  const params = { step, tour };
  trackEvent(PRODUCT_WALKTHROUGH.WALKTHROUGH_STEP_DONE, params, params);
};

export const trackWalkthroughCompleted = (tour: string) => {
  const params = { tour };
  trackEvent(PRODUCT_WALKTHROUGH.WALKTHROUGH_COMPLETED, params);
};
