import { trackEvent } from "modules/analytics";
import { TEAMS } from "../constants";
import { apiClientMultiWorkspaceViewStore } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

export const trackWorkspaceSwitched = (source) => {
  const params = { source };
  trackEvent(TEAMS.WORKSPACE_SWITCHED, params);
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

export const trackWorkspaceDeleteClicked = () => {
  trackEvent(TEAMS.WORKSPACE_DELETE_CLICKED);
};

export const trackWorkspaceDeleted = (device_data_deleted) => {
  trackEvent(TEAMS.WORKSPACE_DELETED, { device_data_deleted });
};

export const trackTeamPlanCardShown = (domains) => {
  const params = { domains };
  trackEvent(TEAMS.REQUEST_TEAM_PLAN_CARD_SHOWN, params);
};

export const trackTeamPlanCardClicked = (domain, source) => {
  const params = { domain, source };
  trackEvent(TEAMS.REQUEST_TEAM_PLAN_CARD_CLICKED, params);
};

export const trackWorkspaceSettingToggled = (active_tab) => {
  const params = { active_tab };
  trackEvent(TEAMS.WORKSPACE_SETTING_TOGGLED, params);
};
export const trackWorkspaceDropdownClicked = (action) => {
  const params = { action };
  trackEvent(TEAMS.WORKSPACE_DROPDOWN_CLICKED, params);
};

export const trackAddWorkspaceNameModalViewed = (source) => {
  const params = { source };
  trackEvent(TEAMS.ADD_WORKSPACE_NAME_MODAL_VIEWED, params);
};

export const trackAddMembersInWorkspaceModalViewed = (source) => {
  const params = { source };
  trackEvent(TEAMS.ADD_MEMBERS_IN_WORKSPACE_MODAL_VIEWED, params);
};

export const trackCreateNewTeamClicked = (source) => {
  const params = { source };
  trackEvent(TEAMS.CREATE_NEW_TEAM_CLICKED, params);
};

export const trackWorkspaceInviteLinkCopied = (source) => {
  const params = { source };
  trackEvent(TEAMS.WORKSPACE_INVITE_LINK_COPIED, params);
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
export const trackWorkspaceInviteAnimationViewed = () => {
  trackEvent(TEAMS.WORKSPACE_INVITE_ANIMATION_VIEWED);
};

export const trackTeamPlanBannerViewed = () => {
  trackEvent(TEAMS.GET_TEAM_PLAN_BANNER_VIEWED);
};

export const trackTeamPlanBannerClicked = (action, source) => {
  trackEvent(TEAMS.GET_TEAM_PLAN_BANNER_CLICKED, { action, source });
};

export const trackMultiWorkspaceSelected = (source) => {
  const { viewMode, selectedWorkspaces } = apiClientMultiWorkspaceViewStore.getState();
  trackEvent(TEAMS.MULTI_WORKSPACE_SELECTED, {
    view_mode: viewMode,
    final_workspace_count: selectedWorkspaces.length,
    source,
  });
};

export const trackMultiWorkspaceDeselected = (source) => {
  const { viewMode, selectedWorkspaces } = apiClientMultiWorkspaceViewStore.getState();
  trackEvent(TEAMS.MULTI_WORKSPACE_DESELECTED, {
    view_mode: viewMode,
    final_workspace_count: selectedWorkspaces.length,
    source,
  });
};

export const trackManageWorkspaceClicked = (source) => {
  trackEvent(TEAMS.MANAGE_WORKSPACE_CLICKED, { source });
};

export const trackNewTeamCreationWorkflowStarted = (type, source) => {
  trackEvent(TEAMS.NEW_TEAM_CREATION_WORKFLOW_STARTED, { type, source });
};

export const trackLocalWorkspaceCreationConflictShown = (conflict_type, source) => {
  trackEvent(TEAMS.LOCAL_WORKSPACE_CREATION_CONFLICT_SHOWN, { conflict_type, source });
};

export const trackLocalWorkspaceCreationModeSelected = (mode, source) => {
  trackEvent(TEAMS.LOCAL_WORKSPACE_CREATION_MODE_SELECTED, { mode, source });
};
