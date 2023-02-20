import { trackEvent } from "modules/analytics";
import { HOME } from "../constants";

export const trackHomeFeatureCardClicked = (feature_card_type) => {
  const params = { feature_card_type };
  trackEvent(HOME.FEATURE_CARD_CLICKED, params);
};
