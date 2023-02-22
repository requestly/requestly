import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackAuthModalShownEvent = (source) => {
  const params = { source };
  trackEvent(AUTH.AUTH_MODAL.SHOWN, params);
};
