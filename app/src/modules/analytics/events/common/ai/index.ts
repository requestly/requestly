import { trackEvent } from "modules/analytics";
import { AI } from "../constants";

export const trackAIFeaturesConsentModalShown = () => {
  trackEvent(AI.AI_FEATURES_CONSENT_MODAL_SHOWN);
};
