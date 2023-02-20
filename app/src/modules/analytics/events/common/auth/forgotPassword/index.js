import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackForgotPasswordAttemptedEvent = ({ email }) => {
  const params = {
    email,
  };
  trackEvent(AUTH.FORGOT_PASSWORD.ATTEMPTED, params);
};

export const trackForgotPasswordFailedEvent = ({ email, error }) => {
  const params = {
    email,
    error,
  };
  trackEvent(AUTH.FORGOT_PASSWORD.FAILED, params);
};

export const trackForgotPasswordSuccessEvent = ({ email }) => {
  const params = {
    email,
  };
  trackEvent(AUTH.FORGOT_PASSWORD.SUCCESS, params);
};
