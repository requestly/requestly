import { trackEvent } from "modules/analytics";
import { PROMO_HEADER } from "./constants";

export const trackPromoHeaderClicked = (id, target_url) => {
  const params = { id, target_url };
  trackEvent(PROMO_HEADER.CLICKED, params);
};
