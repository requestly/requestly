import { createSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSelectedWorkspaces, getWorkspaceById, getWorkspaceViewSlice } from "./slice";
import { switchContext, workspaceViewManager } from "./thunks";
import { ApiClientViewMode, WorkspaceInfo } from "./types";
import { NativeError } from "errors/NativeError";
import { RootState } from "store/types";

const selectAllSelectedWorkspaces = createSelector([getWorkspaceViewSlice], (slice) => getAllSelectedWorkspaces(slice));

export function useGetAllSelectedWorkspaces() {
  return useSelector(selectAllSelectedWorkspaces);
}

export function useWorkspace(workspaceId: WorkspaceInfo["id"]) {
  // @ts-expect-error workspaceId can be null for private, but entity adapter needs a string
  // null as a key works in runtime.
  const workspace = useSelector((state: RootState) => getWorkspaceById(getWorkspaceViewSlice(state), workspaceId));

  if (!workspace) {
    throw new NativeError("Workspace not found!").addContext({ workspaceId });
  }

  return workspace;
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

export function useWorkspaceViewActions() {
  const dispatch = useDispatch();

  const actions = useMemo(() => {
    return {
      async switchContext(params: Parameters<typeof switchContext>[0]) {
        return dispatch(switchContext(params) as any);
      },

      async workspaceViewManager(params: Parameters<typeof workspaceViewManager>[0]) {
        return dispatch(workspaceViewManager(params) as any).unwrap();
      },
    };
  }, [dispatch]);

  return actions;
}
