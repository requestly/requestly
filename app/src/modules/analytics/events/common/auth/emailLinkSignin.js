import { trackEvent } from "modules/analytics";
import { AUTH } from "../constants";

export const trackSignInWithLinkCustomFormSeen = () => {
  trackEvent(AUTH.EMAIL_LINK_SIGNIN_FORM.SEEN);
};

export const trackSignInWithLinkCustomFormSubmitted = () => {
  trackEvent(AUTH.EMAIL_LINK_SIGNIN_FORM.SUBMITTED);
};

export const trackMagicLinkResendRequested = () => {
  trackEvent(AUTH.EMAIL_LINK_SIGNIN_FORM.LINK_RESEND_REQUESTED);
};

export const trackMagicLinkLoginWithGoogleInstead = () => {
  trackEvent(AUTH.EMAIL_LINK_SIGNIN_FORM.LOGIN_WITH_GOOGLE_INSTEAD);
};
