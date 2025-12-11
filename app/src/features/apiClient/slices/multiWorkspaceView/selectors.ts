import { createSelector } from "@reduxjs/toolkit";
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

export const getIsAllWorkspacesLoaded = createSelector([getAllSelectedWorkspaces], (workspaces): boolean => {
  return workspaces.every((w) => !w.state.loading);
});

function getMultiWorkspaceViewSlice(state: RootState) {
  return state.multiWorkspaceView;
}

export const getViewMode = createSelector(
  [getMultiWorkspaceViewSlice],
  (multiWorkspaceView) => multiWorkspaceView.viewMode
);
