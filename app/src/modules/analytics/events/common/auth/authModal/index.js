import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackAuthModalShownEvent = () => {
  trackEvent(AUTH.AUTH_MODAL.SHOWN);
};
