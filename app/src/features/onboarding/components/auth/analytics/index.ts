import { trackEvent } from "modules/analytics";
import { AUTH_SCREEN } from "./constant";

export const trackLoginWithSSOClicked = () => {
  trackEvent(AUTH_SCREEN.LOGIN_WITH_SSO_CLICKED);
};

export const trackSignUpSignInSwitched = (final_state: string) => {
  trackEvent(AUTH_SCREEN.SIGNUP_SIGNIN_SWITCHED, { final_state });
};
