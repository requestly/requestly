import { trackEvent } from "modules/analytics";
import { ONBOARDING } from "../constants";

export const trackSidebarClicked = (feature) => {
  const params = { feature };
  trackEvent(ONBOARDING.SIDEBAR_CLICKED, params);
};
