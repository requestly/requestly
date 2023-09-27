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

export const trackViewGithubClicked = () => {
  trackEvent(BUSINESS.VIEW_GITHUB_CLICKED);
};

export const trackAppsumoCodeRedeemed = (number_of_codes) => {
  const params = { number_of_codes };
  trackEvent(BUSINESS.APPSUMO_CODE_REDEEMED, params);
};
