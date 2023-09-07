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

export const trackShareButtonClicked = (source, selection_count = 1) => {
  const params = { selection_count, source };
  trackEvent(SHARING.SHARE_BUTTON_CLICKED, params);
};

export const trackShareModalViewed = (selection_count, source, num_team_workspaces) => {
  const params = { selection_count, source, num_team_workspaces };
  trackEvent(SHARING.SHARE_MODAL_VIEWED, params);
};
