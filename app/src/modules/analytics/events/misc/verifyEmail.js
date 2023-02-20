import { VERIFY_EMAIL_CLICKED } from "./constants";
import { trackEvent } from "modules/analytics";

export const trackVerifyEmailClicked = () => {
  trackEvent(VERIFY_EMAIL_CLICKED);
};
