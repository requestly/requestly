import { trackEvent } from "modules/analytics";
import { ONBOARDING } from "../constants";

export const trackProductHuntBannerClicked = () => {
  const params = { source: "app_banner" };
  trackEvent(ONBOARDING.PRODUCT_HUNT_BANNER_CLICKED, params);
};
