import { trackEvent } from "modules/analytics";
import { ONBOARDING } from "../constants";

export const trackHeaderClicked = (action) => {
  const params = { action };
  trackEvent(ONBOARDING.HEADER_CLICKED, params);
};

export const trackHelpdeskClicked = (action) => {
  const params = { action };
  trackEvent(ONBOARDING.HELPDESK_CLICKED, params);
};

export const trackTopbarClicked = (action, kwargs) => {
  const params = { action, ...kwargs };
  trackEvent(ONBOARDING.TOPBAR_CLICKED, params);
};
