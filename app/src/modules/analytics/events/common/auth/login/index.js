import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackLoginAttemptedEvent = ({ auth_provider, email, place, email_type, domain, source }) => {
  const params = {
    auth_provider,
    email,
    place: place ?? window.location.href,
    email_type,
    domain,
    source,
  };

  trackEvent(AUTH.LOGIN.ATTEMPTED, params);
};

export const trackLoginFailedEvent = ({ auth_provider, place, email, error_message, source }) => {
  const params = {
    auth_provider,
    place,
    email,
    error_message,
    source,
  };
  trackEvent(AUTH.LOGIN.FAILED, params);
};

export const trackLoginRequestedEvent = ({ auth_provider, place }) => {
  const params = {
    place,
    auth_provider,
  };
  trackEvent(AUTH.LOGIN.REQUESTED, params);
};

export const trackLoginSuccessEvent = ({ auth_provider, uid, place, email, email_type, domain, source }) => {
  const params = {
    auth_provider,
    uid,
    place: place ?? window.location.href,
    email,
    email_type,
    domain,
    source,
  };

  trackEvent(AUTH.LOGIN.SUCCESS, params);
};
