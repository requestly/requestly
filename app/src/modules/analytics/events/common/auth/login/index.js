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

/**
 *
 * @param { {auth_provider, place, email, error_code?:string, error_message, source} } params
 */
export const trackLoginFailedEvent = (params) => {
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

export const trackEmailLoginLinkGenerated = (email, source) => {
  trackEvent(AUTH.AUTH_MODAL.EMAIL_LOGIN_LINK_GENERATED, { email, source });
};

export const trackGenerateMagicLinkFailed = (email, source, errMsg) => {
  trackEvent(AUTH.AUTH_MODAL.GENERATE_MAGIC_LINK_FAILED, { email, source, errMsg });
};

export const trackLoginButtonClicked = (source) => {
  const params = { source };
  trackEvent(AUTH.LOGIN.BUTTON_CLICKED, params);
};

export const trackLoginUserSwitchedEmail = (source) => {
  const params = { source };
  trackEvent(AUTH.LOGIN.USER_SWITCHED_EMAIL, params);
};
