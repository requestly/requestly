import { trackEvent } from "modules/analytics";
import { ONBOARDING } from "../constants";

export const trackAppNotificationBannerViewed = () => {
  trackEvent(ONBOARDING.APP_NOTIFICATION_BANNER_VIEWED);
};
