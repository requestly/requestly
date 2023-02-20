import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackVerifyOobCodeAttempted = () => {
  trackEvent(AUTH.VERIFY_OOBCODE.ATTEMPTED);
};

export const trackVerifyOobCodeFailed = () => {
  trackEvent(AUTH.VERIFY_OOBCODE.FAILED);
};

export const trackVerifyOobCodeSuccess = () => {
  trackEvent(AUTH.VERIFY_OOBCODE.SUCCESS);
};
