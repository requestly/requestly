import { trackEvent } from "modules/analytics";
import { TEAMS } from "../constants";

export const trackWorkspaceSwitched = () => {
  trackEvent(TEAMS.WORKSPACE_SWITCHED);
};

export const trackInviteTeammatesClicked = (event_src) => {
  const params = { event_src };

  trackEvent(TEAMS.INVITE_TEAMMATES_CLICKED, params);
};

export const trackInviteTeammatesBannerClicked = () => {
  trackEvent(TEAMS.INVITE_TEAMMATES_BANNER_CLICKED);
};

export const trackInviteMoreTeammatesButtonClicked = () => {
  trackEvent(TEAMS.INVITE_MORE_TEAMMATES_BUTTON_CLICKED);
};

export const trackCreateNewWorkspaceLinkClicked = () => {
  trackEvent(TEAMS.CREATE_NEW_WORKSPACE_LINK_CLICKED);
};

export const trackCreateNewWorkspaceButtonClicked = () => {
  trackEvent(TEAMS.CREATE_NEW_WORKSPACE_BUTTON_CLICKED);
};
export const trackNewWorkspaceCreated = () => {
  trackEvent(TEAMS.NEW_WORKSPACE_CREATED);
};
export const trackAddMemberClicked = () => {
  trackEvent(TEAMS.ADD_MEMBER_CLICKED);
};
