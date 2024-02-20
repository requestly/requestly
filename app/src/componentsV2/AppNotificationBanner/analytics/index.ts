import { trackEvent } from "modules/analytics";
import { APP_BANNER } from "./constants";

export const trackAppNotificationBannerViewed = (bannerId: string) => {
  trackEvent(APP_BANNER.APP_NOTIFICATION_BANNER_VIEWED, { bannerId });
};

export const trackAppBannerCtaClicked = (bannerId: string, cta: string) => {
  trackEvent(APP_BANNER.APP_NOTIFICATION_BANNER_CTA_CLICKED, { bannerId, cta });
};

export const trackAppBannerDismissed = (bannerId: string) => {
  trackEvent(APP_BANNER.APP_NOTIFICATION_BANNER_DISMISSED, { bannerId });
};
