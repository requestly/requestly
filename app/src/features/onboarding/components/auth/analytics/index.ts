import { trackEvent } from "modules/analytics";
import { AUTH_SCREEN } from "./constant";

export const trackLoginWithSSOClicked = () => {
  trackEvent(AUTH_SCREEN.LOGIN_WITH_SSO_CLICKED);
};
