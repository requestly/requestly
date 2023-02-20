import { trackEvent } from "modules/analytics";
import { TEAMS } from "../constants";

export const trackNewTeamCreateSuccess = (id, name) => {
  const params = { id, name };
  trackEvent(TEAMS.NEW_TEAM_CREATE_SUCCESS, params);
};

export const trackNewTeamCreateFailure = (name) => {
  const params = { name };
  trackEvent(TEAMS.NEW_TEAM_CREATE_FAILURE, params);
};

export const trackAddTeamMemberSuccess = (team_id, email, is_admin) => {
  const params = { team_id, email, is_admin };
  trackEvent(TEAMS.ADD_TEAM_MEMBER_SUCCESS, params);
};

export const trackAddTeamMemberFailure = (team_id, email, error) => {
  const params = { team_id, email, error };
  trackEvent(TEAMS.ADD_TEAM_MEMBER_FAILURE, params);
};
