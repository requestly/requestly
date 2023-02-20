import { trackEvent } from "modules/analytics";
import { BUSINESS } from "../constants";

export const trackTrialModeExpiredModalShown = () => {
  trackEvent(BUSINESS.TRIAL_MODE_EXPIRED_MODAL_SHOWN);
};

export const trackUpgradeButtonClickedOnTrialExpiredModal = () => {
  trackEvent(BUSINESS.TRIAL_MODE_EXPIRED_UPGRADE_BUTTON_CLICKED);
};

export const trackUpgradeNowClickedEvent = (reason, source) => {
  const params = { reason, source };
  trackEvent(BUSINESS.UPGRADE_CLICKED, params);
};
