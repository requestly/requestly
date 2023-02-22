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

export const trackTeamPlanCardShown = (domain) => {
  const params = { domain };
  trackEvent(TEAMS.REQUEST_TEAM_PLAN_CARD_SHOWN, params);
};

export const trackTeamPlanCardClicked = (domain) => {
  const params = { domain };
  trackEvent(TEAMS.REQUEST_TEAM_PLAN_CARD_CLICKED, params);
};

export const trackTeamPlanInterestCaptured = (domain) => {
  const params = { domain };
  trackEvent(TEAMS.TEAM_PLAN_INTEREST_CAPTURED, params);
};
