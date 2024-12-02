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

export const getActiveWorkspaceId = (state: RootState) => {
  return sliceRootState(state).activeWorkspaceId;
};
