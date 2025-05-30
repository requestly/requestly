import { trackEvent } from "modules/analytics";
import { TEAMS } from "../constants";

export const trackNewTeamCreateSuccess = (id, name, source, workspace_type, notify_all_teammates = false) => {
  const params = { id, name, source, workspace_type, notify_all_teammates };
  trackEvent(TEAMS.NEW_TEAM_CREATE_SUCCESS, params);
};

export const trackNewTeamCreateFailure = (name, workspace_type) => {
  const params = { name, workspace_type };
  trackEvent(TEAMS.NEW_TEAM_CREATE_FAILURE, params);
};

export const trackAddTeamMemberSuccess = ({ team_id, email, is_admin, source, num_users_added, workspace_type }) => {
  const params = { team_id, email, is_admin, source, num_users_added, workspace_type };
  trackEvent(TEAMS.ADD_TEAM_MEMBER_SUCCESS, params);
};

export const trackAddTeamMemberFailure = (team_id, email, error, source) => {
  const params = { team_id, email, error, source };
  trackEvent(TEAMS.ADD_TEAM_MEMBER_FAILURE, params);
};

export const trackWorkspaceInviteLinkGenerated = (team_id) => {
  const params = { team_id };
  trackEvent(TEAMS.WORKSPACE_INVITE_LINK_GENERATED, params);
};

export const trackWorkspaceInviteLinkRevoked = (team_id) => {
  const params = { team_id };
  trackEvent(TEAMS.WORKSPACE_INVITE_LINK_REVOKED, params);
};

export const trackWorkspaceInviteAccepted = (team_id, team_name, invite_id, source, usage_type, members_count) => {
  const params = { team_id, team_name, source, invite_id, usage_type, members_count };
  trackEvent(TEAMS.WORKSPACE_INVITE_ACCEPTED, params);
};

export const trackWorkspaceInviteScreenError = (error_type, team_id, invite_id) => {
  const params = { team_id, invite_id, error_type };
  trackEvent(TEAMS.WORKSPACE_INVITE_SCREEN_ERROR, params);
};

export const trackWorkspaceJoiningModalOpened = (pending_invites, source) => {
  const params = { pending_invites, source };
  trackEvent(TEAMS.WORKSPACE_JOINING_MODAL_OPENED, params);
};

export const trackWorkspaceJoinClicked = (team_id, source) => {
  const params = { team_id, source };
  trackEvent(TEAMS.WORKSPACE_JOIN_CLICKED, params);
};

export const trackWorkspaceOnboardingViewed = () => {
  trackEvent(TEAMS.WORKSPACE_ONBOARDING_VIEWED);
};
