import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackResetPasswordAttemptedEvent = () => {
  trackEvent(AUTH.RESET_PASSWORD.ATTEMPTED);
};

export const trackResetPasswordFailedEvent = () => {
  trackEvent(AUTH.RESET_PASSWORD.FAILED);
};

export const trackResetPasswordSuccessEvent = () => {
  trackEvent(AUTH.RESET_PASSWORD.SUCCESS);
};
