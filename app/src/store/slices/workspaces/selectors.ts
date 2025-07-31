import { RootState } from "store/types";
import { workspacesEntityAdapter } from "./slice";
import { ReducerKeys } from "store/constants";
import { Workspace, WorkspaceType } from "features/workspaces/types";

const sliceRootState = (state: RootState) => state[ReducerKeys.WORKSPACE];

const workspacesEntitySelectors = workspacesEntityAdapter.getSelectors(
  (state: RootState) => sliceRootState(state)["allWorkspaces"]
);

export const getWorkspaceById = (id?: Workspace["id"]) => (state: RootState) =>
  workspacesEntitySelectors.selectById(state, id);

export const getAllWorkspaces = (state: RootState) => workspacesEntitySelectors.selectAll(state);

export const getActiveWorkspaceId = (state: RootState) => getActiveWorkspaceIds(state)?.[0];

export const getActiveWorkspaceIds = (state: RootState) => {
  return sliceRootState(state).activeWorkspaceIds;
};

const dummyPersonalWorkspace = {
  id: null,
  name: "Private Workspace",
  membersCount: null,
  workspaceType: "PERSONAL",
} as Workspace;

export const getActiveWorkspace = (state: RootState) => {
  const activeWorkspaceId = getActiveWorkspaceId(state);

  if (!activeWorkspaceId) {
    // Backward compatibility for Private Workspacese
    return dummyPersonalWorkspace;
  }

  return getWorkspaceById(activeWorkspaceId)(state);
};

export const isPersonalWorkspacePersonal = (state: RootState) => {
  const activeWorkspace = getActiveWorkspace(state);
  return activeWorkspace?.workspaceType === WorkspaceType.PERSONAL;
};

export const isActiveWorkspaceShared = (state: RootState) => {
  // In future, we need to check workspaceType === WorkspaceType.SHARED
  return !!getActiveWorkspaceId(state);
};

export const getWorkspacesUpdatedAt = (state: RootState) => sliceRootState(state).workspacesUpdatedAt;

export const getActiveWorkspacesMembers = (state: RootState) => sliceRootState(state).activeWorkspacesMembers;
