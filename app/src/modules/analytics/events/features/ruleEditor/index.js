import { trackEvent } from "modules/analytics";
import { RULE_EDITOR } from "../constants";

export const trackServeResponseWithoutRequestEnabled = () => {
  trackEvent(RULE_EDITOR.MODIFY_API_RESPONSE.SERVE_WITHOUT_REQUEST_ENABLED);
};
