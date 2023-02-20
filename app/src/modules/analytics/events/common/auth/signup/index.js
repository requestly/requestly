import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackSignupSuccessEvent = ({
  auth_provider,
  email,
  ref_code,
  uid,
  email_type,
  domain,
  source,
}) => {
  const params = {
    auth_provider,
    email,
    ref_code,
    uid,
    email_type,
    domain,
    source,
  };
  trackEvent(AUTH.SIGNUP.SUCCESS, params);
};

export const trackSignUpAttemptedEvent = ({
  auth_provider,
  email,
  ref_code,
  email_type,
  domain,
  source,
}) => {
  const params = {
    auth_provider,
    email,
    ref_code,
    email_type,
    domain,
    source,
  };
  trackEvent(AUTH.SIGNUP.ATTEMPTED, params);
};

export const trackSignUpFailedEvent = ({
  auth_provider,
  email,
  error,
  source,
}) => {
  const params = {
    auth_provider,
    email,
    error,
    source,
  };
  trackEvent(AUTH.SIGNUP.FAILED, params);
};
