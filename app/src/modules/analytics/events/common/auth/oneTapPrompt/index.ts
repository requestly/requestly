import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackOneTapPromptVisible = () => {
  trackEvent(AUTH.AUTH_ONE_TAP_PROMPT.VISIBLE);
};
