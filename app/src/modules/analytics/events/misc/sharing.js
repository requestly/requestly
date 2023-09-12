import { trackEvent } from "modules/analytics";
import { SHARING } from "./constants";

export const trackSharingTabSwitched = (tab) => {
  const params = { tab };
  trackEvent(SHARING.SHARING_TAB_SWITCHED, params);
};

export const trackShareButtonClicked = (source, selection_count = 1) => {
  const params = { selection_count, source };
  trackEvent(SHARING.SHARE_BUTTON_CLICKED, params);
};

export const trackShareModalViewed = (selection_count, source, num_team_workspaces) => {
  const params = { selection_count, source, num_team_workspaces };
  trackEvent(SHARING.SHARE_MODAL_VIEWED, params);
};

export const trackShareModalWorkspaceDropdownClicked = () => {
  trackEvent(SHARING.SHARING_MODAL_WORKSPACE_DROPDOWN_CLICKED);
};

export const trackSharingUrlInWorkspaceCopied = (urlType) => {
  const params = { urlType };
  trackEvent(SHARING.SHARING_URL_IN_WORKSPACE_COPIED, params);
};

export const trackSharingModalRulesDuplicated = (currentWorkspace, count) => {
  const params = { currentWorkspace, count };
  trackEvent(SHARING.SHARING_MODAL_RULES_DUPLICATED, params);
};

export const trackSharingModalToastViewed = (message) => {
  const params = { message };
  trackEvent(SHARING.SHARING_MODAL_TOAST_VIEWED, params);
};
