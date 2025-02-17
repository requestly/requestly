import { ReducerKeys } from "store/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { TeamRole, WorkspaceType } from "types";

export const getTeamsState = (state) => {
  return state[ReducerKeys.TEAMS];
};

export const getAvailableTeams = (state) => {
  return getTeamsState(state).availableTeams;
};

export const getCurrentlyActiveWorkspace = (state) => {
  return getTeamsState(state).currentlyActiveWorkspace;
};
export const getIsWorkspaceMode = (state) => {
  return !!getTeamsState(state).currentlyActiveWorkspace.id;
};

export const getIsWorkspaceLocal = (state) => {
  const teamsState = getTeamsState(state);
  const teamId = teamsState.currentlyActiveWorkspace.id;
  const team = teamsState.availableTeams.find((team) => team.id === teamId);
  return team?.workspaceType === WorkspaceType.LOCAL;
};

export const getWorkspaceRootPath = (state) => {
  const teamsState = getTeamsState(state);
  const teamId = teamsState.currentlyActiveWorkspace.id;
  const team = teamsState.availableTeams.find((team) => team.id === teamId);
  return team?.rootPath;
};

export const getCurrentlyActiveWorkspaceMembers = (state) => {
  return getTeamsState(state).currentlyActiveWorkspaceMembers;
};

export const getUserTeamRole = (state) => {
  const user = getUserAuthDetails(state);
  const userId = user?.details?.profile?.uid;

  if (!userId) return null;

  const memberData = getCurrentlyActiveWorkspaceMembers(state)[userId];

  if (!memberData) return null;
  if (memberData.isOwner || memberData.isAdmin) return TeamRole.admin;
  return TeamRole.write;
};
