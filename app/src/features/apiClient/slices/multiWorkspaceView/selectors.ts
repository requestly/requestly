import { createSelector } from "@reduxjs/toolkit";
import { multiWorkspaceViewAdapter, multiWorkspaceViewSlice } from "./multiWorkspaceViewSlice";
import { RootState } from "store/types";

const workspacesSelectors = multiWorkspaceViewAdapter.getSelectors();

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
  return state[multiWorkspaceViewSlice.name];
}

export const getViewMode = createSelector(
  [getMultiWorkspaceViewSlice],
  (multiWorkspaceView) => multiWorkspaceView.viewMode
);
