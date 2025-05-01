import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackSignupSuccessEvent = ({ auth_provider, email, ref_code, uid, email_type, domain, source }) => {
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

export const trackSignUpAttemptedEvent = ({ auth_provider, email, ref_code, email_type, domain, source }) => {
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

export const trackSignUpFailedEvent = ({ auth_provider, email, error, source }) => {
  const params = {
    auth_provider,
    email,
    error,
    source,
  };
  trackEvent(AUTH.SIGNUP.FAILED, params);
};

export const trackSignUpButtonClicked = (source) => {
  const params = { source };
  trackEvent(AUTH.SIGNUP.BUTTON_CLICKED, params);
};

export const trackLoginEmailEntered = () => {
  trackEvent(AUTH.LOGIN.EMAIL_ENTERED);
};

export const trackBstackLoginInitiated = () => {
  trackEvent(AUTH.LOGIN.BSTACK_LOGIN_INITIATED);
};

export const trackLoginUserNotFound = (email) => {
  trackEvent(AUTH.LOGIN.USER_NOT_FOUND, { email });
};

export const trackLoginWithSSOClicked = () => {
  trackEvent(AUTH.LOGIN.LOGIN_WITH_SSO_CLICKED);
};

export const trackLoginWithGoogleClicked = () => {
  trackEvent(AUTH.LOGIN.LOGIN_WITH_GOOGLE_CLICKED);
};

export const trackSignInWithMagicLinkClicked = () => {
  trackEvent(AUTH.LOGIN.LOGIN_WITH_MAGIC_LINK_CLICKED);
};

export const trackLoginWithPasswordClicked = () => {
  trackEvent(AUTH.LOGIN.LOGIN_WITH_PASSWORD_CLICKED);
};
