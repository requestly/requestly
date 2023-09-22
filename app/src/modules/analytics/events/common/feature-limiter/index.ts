import { trackEvent } from "modules/analytics";
import { FEATURE_LIMITER } from "../constants";

export const trackFeatureLimitUpgradeBannerClicked = () => {
  trackEvent(FEATURE_LIMITER.UPGRADE_BANNER_CLICKED);
};

export const trackFeatureLimitUpgradeBannerViewed = () => {
  trackEvent(FEATURE_LIMITER.UPGRADE_BANNER_VIEWED);
};
