import { createSelector } from "@reduxjs/toolkit";
import { getMultiWorkspaceViewSlice, getAllSelectedWorkspaces } from "./selectors";
import { useSelector } from "react-redux";

const selectAllSelectedWorkspaces = createSelector([getMultiWorkspaceViewSlice], (slice) =>
  getAllSelectedWorkspaces(slice)
);

export function useGetAllSelectedWorkspaces() {
  return useSelector(selectAllSelectedWorkspaces);
}

const selectIsAllWorkspacesLoaded = createSelector([selectAllSelectedWorkspaces], (workspaces) =>
  workspaces.every((w) => !w.state.loading)
);

export function useIsAllWorkspacesLoaded() {
  return useSelector(selectIsAllWorkspacesLoaded);
}

const selectViewMode = createSelector([getMultiWorkspaceViewSlice], (s) => s.viewMode);

export function useViewMode() {
  return useSelector(selectViewMode);
}
