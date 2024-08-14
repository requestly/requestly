import { ReducerKeys } from "store/constants";
import { getUserAuthDetails } from "store/selectors";
import { TeamRole } from "types";

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
