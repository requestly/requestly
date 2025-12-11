import { multiWorkspaceViewAdapter } from "./multiWorkspaceViewSlice";
import { RootState } from "store/types";
import { MultiWorkspaceViewState } from "./types";

const workspacesSelectors = multiWorkspaceViewAdapter.getSelectors<MultiWorkspaceViewState>(
  (s) => s.selectedWorkspaces
);

export const getSelectedWorkspaceIds = workspacesSelectors.selectIds;
export const getAllSelectedWorkspaces = workspacesSelectors.selectAll;
export const getSelectedWorkspacesEntities = workspacesSelectors.selectEntities;
export const getSelectedWorkspaceCount = workspacesSelectors.selectTotal;
export const getWorkspaceById = workspacesSelectors.selectById;

export function getIsSelected(state: RootState, id: string) {
  return id in state.multiWorkspaceView.selectedWorkspaces.entities;
}

export function getMultiWorkspaceViewSlice(state: RootState) {
  return state.multiWorkspaceView;
}

export function getViewMode(state: RootState) {
  return getMultiWorkspaceViewSlice(state).viewMode;
}
