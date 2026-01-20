import { trackEvent } from "modules/analytics";
import { ECOSYSTEM } from "../constants";

export const trackEcosystemFeatureClicked = (feature) => {
  const params = { feature };
  trackEvent(ECOSYSTEM.ECOSYSTEM_FEATURE_CLICKED, params);
};
