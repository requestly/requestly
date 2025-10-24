import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackAuthModalShownEvent = (source: string, type: string = "") => {
  const params = { source, type };
  trackEvent(AUTH.AUTH_MODAL.SHOWN, params);
};
