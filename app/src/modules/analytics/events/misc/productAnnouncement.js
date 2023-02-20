import { trackEvent } from "modules/analytics";
import { PRODUCT_ANNOUNCEMENT } from "./constants";

export const trackProductAnnouncementClicked = (feature, location) => {
  const params = { feature, location };
  trackEvent(PRODUCT_ANNOUNCEMENT.CLICKED, params);
};

export const trackProductAnnouncementViewed = (feature, location) => {
  const params = { feature, location };
  trackEvent(PRODUCT_ANNOUNCEMENT.VIEWED, params);
};
