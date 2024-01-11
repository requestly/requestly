import { trackEvent } from "modules/analytics";
import { AUTH } from "../constants";

export const trackSignInWithLinkCustomFormSeen = () => {
  trackEvent(AUTH.EMAIL_LINK_SIGNIN_FORM.SEEN);
};

export const trackSignInWithLinkCustomFormSubmitted = () => {
  trackEvent(AUTH.EMAIL_LINK_SIGNIN_FORM.SUBMITTED);
};
