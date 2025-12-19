import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { getAllSelectedWorkspaces, getWorkspaceViewSlice } from "./slice";

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
