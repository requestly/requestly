import { trackEvent } from "modules/analytics";
import { FEEDBACK } from "./constants";

export const trackFeedbackSubmitted = (suggestions, recommend) => {
  const params = {
    recommend,
    suggestions,
  };
  trackEvent(FEEDBACK.SUBMITTED, params);
};
