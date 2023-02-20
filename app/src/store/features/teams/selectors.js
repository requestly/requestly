import { ReducerKeys } from "store/constants";

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
