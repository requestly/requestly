import { trackEvent } from "modules/analytics";
import { SHARING } from "./constants";

export const trackSharingTabSwitched = (tab) => {
  const params = { tab };
  trackEvent(SHARING.SHARING_TAB_SWITCHED, params);
};

export const trackRulesDownloadClicked = (num_rules) => {
  const params = { num_rules };
  trackEvent(SHARING.RULES_DOWNLOAD_CLICKED, params);
};
