import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackLogoutAttempted = () => {
  trackEvent(AUTH.LOGOUT.ATTEMPTED, {});
};

export const trackLogoutFailed = () => {
  trackEvent(AUTH.LOGOUT.FAILED, {});
};

export const trackLogoutSuccess = () => {
  trackEvent(AUTH.LOGOUT.SUCCESS, {});
};
