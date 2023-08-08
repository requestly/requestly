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

export const trackCreateNewWorkspaceClicked = (source) => {
  const params = { source };
  trackEvent(TEAMS.CREATE_NEW_WORKSPACE_CLICKED, params);
};

export const trackNewWorkspaceCreated = () => {
  trackEvent(TEAMS.NEW_WORKSPACE_CREATED);
};

export const trackWorkspaceDeleteClicked = () => {
  trackEvent(TEAMS.WORKSPACE_DELETE_CLICKED);
};

export const trackWorkspaceDeleted = () => {
  trackEvent(TEAMS.WORKSPACE_DELETED);
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

export const trackWorkspaceSettingToggled = (active_tab) => {
  const params = { active_tab };
  trackEvent(TEAMS.WORKSPACE_SETTING_TOGGLED, params);
};
export const trackWorkspaceDropdownClicked = (action) => {
  const params = { action };
  trackEvent(TEAMS.WORKSPACE_DROPDOWN_CLICKED, params);
};
export const trackUpgradeWorkspaceClicked = () => {
  trackEvent(TEAMS.UPGRADE_WORKSPACE_CLICKED);
};

export const trackAddWorkspaceNameModalViewed = (source) => {
  const params = { source };
  trackEvent(TEAMS.ADD_WORKSPACE_NAME_MODAL_VIEWED, params);
};

export const trackAddMembersInWorkspaceModalViewed = () => {
  trackEvent(TEAMS.ADD_MEMBERS_IN_WORKSPACE_MODAL_VIEWED);
};

export const trackCreateNewTeamClicked = (source) => {
  const params = { source };
  trackEvent(TEAMS.CREATE_NEW_TEAM_CLICKED, params);
};

export const trackWorkspaceInviteLinkCopied = (source) => {
  const params = { source };
  trackEvent(TEAMS.WORKSPACE_INVITE_LINK_COPIED, params);
};

export const trackOnboardingWorkspaceSkip = (step) => {
  const params = { step };
  trackEvent(TEAMS.ONBOARDING_WORKSPACE_SKIP, params);
};

export const trackWorkspaceOrganizationCardViewed = (domain, cta) => {
  const params = { domain, cta };
  trackEvent(TEAMS.TEAM_WORKSPACE_ORGANIZATION_CARD_VIEWED, params);
};

export const trackWorkspaceOrganizationCardCancelled = (domain, cta) => {
  const params = { domain, cta };
  trackEvent(TEAMS.TEAM_WORKSPACE_ORGANIZATION_CARD_CANCELLED, params);
};
export const trackWorkspaceOrganizationCardClicked = (action) => {
  const params = { action };
  trackEvent(TEAMS.TEAM_WORKSPACE_ORGANIZATION_CARD_CLICKED, params);
};
