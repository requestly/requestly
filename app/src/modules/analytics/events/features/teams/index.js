import { trackEvent } from "modules/analytics";
import { TEAMS } from "../constants";

export const trackNewTeamCreateSuccess = (id, name, source) => {
  const params = { id, name, source };
  trackEvent(TEAMS.NEW_TEAM_CREATE_SUCCESS, params);
};

export const trackNewTeamCreateFailure = (name) => {
  const params = { name };
  trackEvent(TEAMS.NEW_TEAM_CREATE_FAILURE, params);
};

export const trackAddTeamMemberSuccess = (team_id, email, is_admin, source) => {
  const params = { team_id, email, is_admin, source };
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

export const trackWorkspaceInviteAccepted = (team_id, invite_id, source, usage_type) => {
  const params = { team_id, source, invite_id, usage_type };
  trackEvent(TEAMS.WORKSPACE_INVITE_ACCEPTED, params);
};

export const trackWorkspaceInviteScreenError = (error_type, team_id, invite_id) => {
  const params = { team_id, invite_id, error_type };
  trackEvent(TEAMS.WORKSPACE_INVITE_SCREEN_ERROR, params);
};

export const trackWorkspaceJoiningModalOpened = (pending_invites) => {
  const params = { pending_invites };
  trackEvent(TEAMS.WORKSPACE_JOINING_MODAL_OPENED, params);
};

export const trackWorkspaceJoinClicked = (team_id, source) => {
  const params = { team_id, source };
  trackEvent(TEAMS.WORKSPACE_JOIN_CLICKED, params);
};

export const trackWorkspaceOnboardingViewed = () => {
  trackEvent(TEAMS.WORKSPACE_ONBOARDING_VIEWED);
};
