import { createAsyncThunk } from "@reduxjs/toolkit";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { multiWorkspaceViewActions, multiWorkspaceViewSlice } from "./multiWorkspaceViewSlice";
import { ApiClientViewMode, WorkspaceViewState } from "./types";
import { getAllSelectedWorkspaces, getSelectedWorkspaceCount, getViewMode } from "./selectors";
import { RootState } from "store/types";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { apiClientContextService } from "./helpers/ApiClientContextService";
import { apiClientContextRegistry } from "./helpers/ApiClientContextRegistry";
import { UserDetails } from "./helpers/ApiClientContextService/ApiClientContextService";
import { ReducerKeys } from "store/constants";
import {
  defaultPersonalWorkspace,
  getWorkspaceById as getWorkspaceDetailsById,
} from "store/slices/workspaces/selectors";
import { NativeError } from "errors/NativeError";
import { reduxStore } from "store";

const SLICE_NAME = ReducerKeys.MULTI_WORKSPACE_VIEW;

type UserAction = "add" | "remove";

function workspaceViewManager(params: { workspaces: Workspace[]; action: UserAction }) {
  const { workspaces, action } = params;
  const viewMode = getViewMode(reduxStore.getState());

  if (action === "add") {
    if (viewMode === "SINGLE") {
      return singleToMultiView(workspaces);
    }

    if (viewMode === "MULTI") {
      return addWorkspacesIntoMultiView(workspaces);
    }
  }

  if (action === "remove") {
    const selectedWorkspacesCount = getSelectedWorkspaceCount(reduxStore.getState().multiWorkspaceView);
    const remaining = selectedWorkspacesCount - workspaces.length;
    if (viewMode === "MULTI" && remaining === 0) {
      return multiViewToSingle();
    }

    if (viewMode === "MULTI" && remaining >= 1) {
      const ids = workspaces.map((w) => w.id);
      return removeWorkspacesFromView(ids);
    }
  }
}

function addWorkspacesIntoMultiView(workspaces: Workspace[]) {
  const workspacesToAdd = workspaces.map<WorkspaceViewState>((w) => ({
    id: w.id,
    state: { loading: true, errored: false },
  }));

  reduxStore.dispatch(multiWorkspaceViewSlice.actions.addWorkspaces(workspacesToAdd));
}

function removeWorkspacesFromView(workspaces: Workspace["id"][]) {
  workspaces.forEach((id) => {
    // TODO: to be updated after tabs migration
    getTabServiceActions().closeTabsByContext(id);
    apiClientContextRegistry.removeContext(id);
  });

  reduxStore.dispatch(multiWorkspaceViewSlice.actions.removeWorkspaces(workspaces as string[]));
}

function singleToMultiView(workspaces: Workspace[]) {
  // TODO: to be updated after tabs migration
  getTabServiceActions().resetTabs(true);
  apiClientContextRegistry.clearAll();
  reduxStore.dispatch(multiWorkspaceViewSlice.actions.setViewMode(ApiClientViewMode.MULTI));
  addWorkspacesIntoMultiView(workspaces);
}

function multiViewToSingle() {
  // TODO: to be updated after tabs migration
  getTabServiceActions().resetTabs(true);
  apiClientContextRegistry.clearAll();
  reduxStore.dispatch(multiWorkspaceViewActions.resetToSingleView());
}

export const addWorkspaceToView = createAsyncThunk<
  string,
  { workspace: Workspace; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/addWorkspaceToView`, async (payload, { dispatch, getState, rejectWithValue }) => {
  const { workspace, userId } = payload;

  if (workspace.workspaceType !== WorkspaceType.LOCAL) {
    return rejectWithValue("Multi view only available for local workspaces");
  }

  workspaceViewManager({ workspaces: [workspace], action: "add" });
  const workspaceId = workspace.id as string;
  try {
    const userDetails: UserDetails = userId ? { uid: userId, loggedIn: true } : { loggedIn: false };
    await apiClientContextService.createContext(workspace, userDetails);
    dispatch(
      multiWorkspaceViewActions.setWorkspaceState({
        id: workspaceId,
        workspaceState: { loading: false, errored: false },
      })
    );

    return workspaceId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    dispatch(
      multiWorkspaceViewActions.setWorkspaceState({
        id: workspaceId,
        workspaceState: { loading: false, errored: true, error: errorMessage },
      })
    );

    return rejectWithValue(errorMessage);
  }
});

export const removeWorkspaceFromView = createAsyncThunk<
  boolean,
  { workspace: Workspace; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/removeWorkspaceFromView`, async (payload, { dispatch, getState, rejectWithValue }) => {
  const { workspace, userId } = payload;

  if (!workspace.id) {
    return rejectWithValue("Workspace ID is required");
  }

  const viewMode = getViewMode(getState());
  const selectedCount = getSelectedWorkspaceCount(getState().multiWorkspaceView);
  const remaining = selectedCount - 1;
  const willSwitchToSingle = viewMode === ApiClientViewMode.MULTI && remaining === 0;

  try {
    workspaceViewManager({ workspaces: [workspace], action: "remove" });

    if (willSwitchToSingle) {
      const userDetails: UserDetails = userId ? { uid: userId, loggedIn: true } : { loggedIn: false };
      await apiClientContextService.createContext(defaultPersonalWorkspace, userDetails);
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return rejectWithValue(errorMessage);
  }
});

export const loadWorkspaces = createAsyncThunk<
  PromiseSettledResult<string | null>[],
  { userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/loadWorkspaces`, async (payload, { dispatch, getState }) => {
  const { userId } = payload;

  // TODO: test concurreny
  const selectedWorkspaces = getAllSelectedWorkspaces(getState().multiWorkspaceView);
  const workspacesToLoad = selectedWorkspaces.filter((w) => !w.state.loading);

  const workspaces = workspacesToLoad.map((workspaceState) => {
    const workspaceDetails = getWorkspaceDetailsById(workspaceState.id)(getState());

    if (!workspaceDetails) {
      throw new NativeError(`Workspace not found: ${workspaceState.id}`);
    }

    return workspaceDetails;
  });

  // add all workspace
  addWorkspacesIntoMultiView(workspaces);

  // context setup
  const tasks = workspaces.map(async (workspace) => {
    try {
      const userDetails = userId ? { uid: userId, loggedIn: true as const } : { loggedIn: false as const };
      await apiClientContextService.createContext(workspace, userDetails);

      // mark loaded
      dispatch(
        multiWorkspaceViewActions.setWorkspaceState({
          id: workspace.id,
          workspaceState: { loading: false, errored: false },
        })
      );

      return workspace.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred while loading workspace";

      dispatch(
        multiWorkspaceViewActions.setWorkspaceState({
          id: workspace.id,
          workspaceState: { loading: false, errored: true, error: errorMessage },
        })
      );

      throw error;
    }
  });

  const results = await Promise.allSettled(tasks);
  return results;
});
