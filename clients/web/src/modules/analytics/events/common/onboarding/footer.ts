import { trackEvent } from "modules/analytics";
import { ONBOARDING } from "../constants";

export const trackFooterClicked = (action: string) => {
  const params = { action };
  trackEvent(ONBOARDING.FOOTER_CLICKED, params);
};
