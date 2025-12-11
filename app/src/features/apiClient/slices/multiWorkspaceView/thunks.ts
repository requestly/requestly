import { createAsyncThunk } from "@reduxjs/toolkit";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { multiWorkspaceViewActions } from "./multiWorkspaceViewSlice";
import { ApiClientViewMode } from "./types";
import { getAllSelectedWorkspaces, getIsSelected, getViewMode } from "./selectors";
import { RootState } from "store/types";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { apiClientContextService } from "./helpers/ApiClientContextService";
import { apiClientContextRegistry } from "./helpers/ApiClientContextRegistry";
import { UserDetails } from "./helpers/ApiClientContextService/ApiClientContextService";
import { ReducerKeys } from "store/constants";
import { getWorkspaceById as getWorkspaceDetailsById } from "store/slices/workspaces/selectors";
import { NativeError } from "errors/NativeError";

const SLICE_NAME = ReducerKeys.MULTI_WORKSPACE_VIEW;

export const addWorkspaceToView = createAsyncThunk<
  { id: string; success: boolean },
  { workspace: Workspace; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/addWorkspaceToView`, async (payload, { dispatch, getState, rejectWithValue }) => {
  const { workspace, userId } = payload;

  if (workspace.workspaceType !== WorkspaceType.LOCAL) {
    return rejectWithValue("Multi view only available for local workspaces");
  }

  const viewMode = getViewMode(getState());
  if (viewMode !== ApiClientViewMode.MULTI) {
    // TODO: to be updated after tabs migration
    getTabServiceActions().resetTabs(true);
    dispatch(multiWorkspaceViewActions.setViewMode(ApiClientViewMode.MULTI));
  }

  const contextId = workspace.id;
  if (!contextId) {
    return rejectWithValue("Workspace ID is required");
  }

  const isSelected = getIsSelected(getState(), contextId);
  if (isSelected) {
    return { id: contextId, success: true };
  }

  dispatch(multiWorkspaceViewActions.addWorkspace(contextId));
  dispatch(
    multiWorkspaceViewActions.setWorkspaceState({
      id: contextId,
      workspaceState: { loading: true, errored: false },
    })
  );

  try {
    const userDetails: UserDetails = userId ? { uid: userId, loggedIn: true } : { loggedIn: false };

    await apiClientContextService.setupContext(workspace, userDetails);

    dispatch(
      multiWorkspaceViewActions.setWorkspaceState({
        id: contextId,
        workspaceState: { loading: false, errored: false },
      })
    );

    return { id: contextId, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    dispatch(
      multiWorkspaceViewActions.setWorkspaceState({
        id: contextId,
        workspaceState: { loading: false, errored: true, error: errorMessage },
      })
    );

    return rejectWithValue(errorMessage);
  }
});

export const removeWorkspaceFromView = createAsyncThunk<
  { id: string; success: boolean },
  { workspaceId: string },
  { state: RootState }
>(`${SLICE_NAME}/removeWorkspaceFromView`, async (payload, { dispatch }) => {
  const { workspaceId } = payload;
  const contextId = workspaceId;

  // TODO: to be updated after tabs migration
  getTabServiceActions().closeTabsByContext(contextId);

  dispatch(multiWorkspaceViewActions.removeWorkspace(contextId));
  apiClientContextRegistry.removeContext(contextId);

  return { id: contextId, success: true };
});

export const resetToSingleView = createAsyncThunk<void, void, { state: RootState }>(
  `${SLICE_NAME}/resetToSingleView`,
  async (_, { dispatch }) => {
    dispatch(multiWorkspaceViewActions.resetToSingleView());
    apiClientContextRegistry.clearAll();
  }
);

export const loadWorkspaces = createAsyncThunk<
  PromiseSettledResult<string>[],
  { userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/loadWorkspaces`, async (payload, { dispatch, getState, signal }) => {
  const { userId } = payload;

  if (signal.aborted) return [];

  const selectedWorkspaces = getAllSelectedWorkspaces(getState().multiWorkspaceView);
  const workspacesToLoad = selectedWorkspaces.filter((w) => !w.state.loading);

  const tasks = workspacesToLoad.map(async (workspaceState) => {
    const workspaceDetails = getWorkspaceDetailsById(workspaceState.id)(getState());

    if (!workspaceDetails) {
      throw new NativeError(`Workspace not found: ${workspaceState.id}`);
    }

    dispatch(
      multiWorkspaceViewActions.setWorkspaceState({
        id: workspaceState.id,
        workspaceState: { loading: true, errored: false },
      })
    );

    try {
      const userDetails = userId ? { uid: userId, loggedIn: true as const } : { loggedIn: false as const };

      if (!workspaceDetails) {
        throw new NativeError(`Workspace details not found: ${workspaceState.id}`);
      }

      await apiClientContextService.setupContext(workspaceDetails, userDetails);

      dispatch(
        multiWorkspaceViewActions.setWorkspaceState({
          id: workspaceState.id,
          workspaceState: { loading: false, errored: false },
        })
      );

      return workspaceState.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred while loading workspace";

      dispatch(
        multiWorkspaceViewActions.setWorkspaceState({
          id: workspaceState.id,
          workspaceState: { loading: false, errored: true, error: errorMessage },
        })
      );

      throw error;
    }
  });

  const results = await Promise.allSettled(tasks);
  return results;
});
