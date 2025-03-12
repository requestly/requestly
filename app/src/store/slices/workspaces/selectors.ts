import { RootState } from "store/types";
import { workspacesEntityAdapter } from "./slice";
import { ReducerKeys } from "store/constants";
import { Workspace } from "features/workspaces/types";

const sliceRootState = (state: RootState) => state[ReducerKeys.WORKSPACE];

const workspacesEntitySelectors = workspacesEntityAdapter.getSelectors(
  (state: RootState) => sliceRootState(state)["allWorkspaces"]
);

export const getWorkspaceById = (id?: Workspace["id"]) => (state: RootState) =>
  workspacesEntitySelectors.selectById(state, id);

export const getAllWorkspaces = (state: RootState) => workspacesEntitySelectors.selectAll(state);

export const getActiveWorkspaceIds = (state: RootState) => {
  return sliceRootState(state).activeWorkspaceIds;
};

export const getActiveWorkspaceId = (state: RootState) => getActiveWorkspaceIds(state)[0];

export const getWorkspacesUpdatedAt = (state: RootState) => sliceRootState(state).workspacesUpdatedAt;

export const getActiveWorkspacesMembers = (state: RootState) => sliceRootState(state).activeWorkspacesMembers;
