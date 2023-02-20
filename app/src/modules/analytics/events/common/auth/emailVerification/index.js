import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackEmailVerificationSuccess = () => {
  const params = {};
  trackEvent(AUTH.EMAIL_VERIFICATION.SUCCESS, params);
};

export const trackEmailVerificationFailed = () => {
  const params = {};
  trackEvent(AUTH.EMAIL_VERIFICATION.FAILED, params);
};

export const trackEmailVerificationSendAttempted = () => {
  const params = {};
  trackEvent(AUTH.EMAIL_VERIFICATION.SEND_ATTEMPTED, params);
};

export const trackEmailVerificationSendFailed = () => {
  const params = {};
  trackEvent(AUTH.EMAIL_VERIFICATION.SEND_FAILED, params);
};

export const trackEmailVerificationSendSuccess = () => {
  const params = {};
  trackEvent(AUTH.EMAIL_VERIFICATION.SEND_SUCCESS, params);
};
