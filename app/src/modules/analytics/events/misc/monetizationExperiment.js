import { trackEvent } from "modules/analytics";
import { MONETIZATION_EXPERIMENT } from "./constants";

export const trackContactUsClicked = (source) => {
  trackEvent(MONETIZATION_EXPERIMENT.CONTACT_US_CLICKED, { source });
};

export const trackUpgradeClicked = (source) => {
  trackEvent(MONETIZATION_EXPERIMENT.UPGRADE_CLICKED, { source });
};

export const trackRenewNowClicked = (source) => {
  trackEvent(MONETIZATION_EXPERIMENT.RENEW_NOW_CLICKED, { source });
};
