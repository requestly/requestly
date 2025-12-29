import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { getAllSelectedWorkspaces, getWorkspaceViewSlice } from "./slice";
import { ApiClientViewMode } from "./types";
import { NativeError } from "errors/NativeError";

const selectAllSelectedWorkspaces = createSelector([getWorkspaceViewSlice], (slice) => getAllSelectedWorkspaces(slice));

export function useGetAllSelectedWorkspaces() {
  return useSelector(selectAllSelectedWorkspaces);
}

const selectIsAllWorkspacesLoaded = createSelector([selectAllSelectedWorkspaces], (workspaces) =>
  workspaces.every((w) => !w.status.loading)
);

export function useIsAllWorkspacesLoaded() {
  return useSelector(selectIsAllWorkspacesLoaded);
}

const selectViewMode = createSelector([getWorkspaceViewSlice], (s) => s.viewMode);

export function useViewMode() {
  return useSelector(selectViewMode);
}

const selectSingleModeWorkspace = createSelector([getWorkspaceViewSlice], (s) => {
  if (s.viewMode !== ApiClientViewMode.SINGLE) {
    throw new NativeError("Can't use 'useGetSingleModeWorkspace' in single view mode!");
  }

  const workspaces = getAllSelectedWorkspaces(s);

  if (workspaces.length !== 1) {
    throw new NativeError("Zero or more than one workspaces found in single view mode!").addContext({
      workspaceCount: workspaces.length,
    });
  }

  const workspace = workspaces[0];
  if (!workspace) {
    throw new NativeError("Workspace not found in single view mode!");
  }

  return workspace;
});

export function useGetSingleModeWorkspace() {
  return useSelector(selectSingleModeWorkspace);
}
