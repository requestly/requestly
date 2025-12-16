import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiClientViewMode, WorkspaceState } from "./types";
import { RootState } from "store/types";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { apiClientContextService } from "./helpers/ApiClientContextService";
import { apiClientContextRegistry } from "./helpers/ApiClientContextRegistry";
import { UserDetails } from "./helpers/ApiClientContextService/ApiClientContextService";
import { ReducerKeys } from "store/constants";
import { reduxStore } from "store";
import { Err, Ok, Result } from "utils/try";
import { getAllSelectedWorkspaces, getSelectedWorkspaceCount, getViewMode, workspaceViewActions } from "./slice";

const SLICE_NAME = ReducerKeys.WORKSPACE_VIEW;

type UserAction = "add" | "remove";

function getUserDetails(userId?: string) {
  const userDetails: UserDetails = userId ? { uid: userId, loggedIn: true } : { loggedIn: false };
  return userDetails;
}

export const workspaceViewManager = createAsyncThunk(
  `${SLICE_NAME}/workspaceViewManager`,
  async (
    params: { workspaces: WorkspaceState[]; action: UserAction; userId?: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const { workspaces, action, userId } = params;
      const viewMode = getViewMode(getState() as RootState);
      if (action === "add") {
        if (viewMode === "SINGLE") {
          return dispatch(singleToMultiView({ workspaces, userId })).unwrap();
        }
        if (viewMode === "MULTI") {
          return dispatch(addWorkspacesIntoMultiView({ workspaces, userId })).unwrap();
        }
      }
      if (action === "remove") {
        const selectedWorkspacesCount = getSelectedWorkspaceCount((getState() as RootState).workspaceView);
        const remaining = selectedWorkspacesCount - workspaces.length;
        const ids = workspaces.map((w) => w.id!);
        if (viewMode === "MULTI" && remaining === 0) {
          const lastUncheckedWorkspace = workspaces[workspaces.length - 1] as WorkspaceState;
          return dispatch(multiViewToSingle({ workspace: lastUncheckedWorkspace, userId })).unwrap();
        }
        if (viewMode === "MULTI" && remaining >= 1) {
          return dispatch(removeWorkspacesFromView({ workspaceIds: ids, userId })).unwrap();
        }
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addWorkspaceIntoView = createAsyncThunk<
  Result<null, Error>,
  { workspace: WorkspaceState; userDetails: UserDetails },
  { state: RootState }
>(`${SLICE_NAME}/addWorkspaceIntoView`, async ({ workspace, userDetails }, { dispatch }) => {
  dispatch(workspaceViewActions.addWorkspace(workspace));

  const result = await apiClientContextService.createContext(workspace, userDetails);
  return result.andThen(() => new Ok(null));
});

const addWorkspacesIntoMultiView = createAsyncThunk<
  PromiseSettledResult<{ workspace: WorkspaceState; result: Result<null, Error> }>[],
  { workspaces: WorkspaceState[]; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/addWorkspacesIntoMultiView`, async ({ workspaces, userId }, { dispatch }) => {
  const userDetails = getUserDetails(userId);

  const results = await Promise.allSettled(
    workspaces.map(async (workspace) => {
      const result = await dispatch(addWorkspaceIntoView({ workspace, userDetails })).unwrap();
      return { workspace, result };
    })
  );

  return results;
});

function removeWorkspaceFromView(params: { workspaceId: string }): Result<null> {
  const { workspaceId } = params;

  try {
    getTabServiceActions().closeTabsByContext(workspaceId);
    apiClientContextRegistry.removeContext(workspaceId);
    reduxStore.dispatch(workspaceViewActions.removeWorkspace(workspaceId));

    return new Ok(null);
  } catch (error) {
    return new Err(error);
  }
}

const removeWorkspacesFromView = createAsyncThunk<
  PromiseSettledResult<{ workspaceId: string; result: Result<null, Error> }>[],
  { workspaceIds: string[]; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/removeWorkspacesFromView`, async ({ workspaceIds, userId }, { getState }) => {
  const results = await Promise.allSettled(
    workspaceIds.map((workspaceId) => {
      const result = removeWorkspaceFromView({ workspaceId });
      return { workspaceId, result };
    })
  );

  return results;
});

const singleToMultiView = createAsyncThunk(
  `${SLICE_NAME}/singleToMultiView`,
  async (params: { workspaces: WorkspaceState[]; userId?: string }, { dispatch }) => {
    getTabServiceActions().resetTabs(true);
    apiClientContextRegistry.clearAll();
    dispatch(workspaceViewActions.setViewMode(ApiClientViewMode.MULTI));
    const result = await dispatch(addWorkspacesIntoMultiView(params));

    return result;
  }
);

const multiViewToSingle = createAsyncThunk<
  { workspace: WorkspaceState; result: Result<null, Error> },
  { workspace: WorkspaceState; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/multiViewToSingle`, async ({ workspace, userId }, { dispatch, getState }) => {
  getTabServiceActions().resetTabs(true);
  apiClientContextRegistry.clearAll();
  dispatch(workspaceViewActions.resetToSingleView());

  const userDetails = getUserDetails(userId);
  const result = await dispatch(addWorkspaceIntoView({ workspace, userDetails })).unwrap();
  return { workspace, result };
});

export const switchContext = createAsyncThunk(
  `${SLICE_NAME}/switchContext`,
  async (params: { workspace: WorkspaceState; userId: string | undefined }, { dispatch }) => {
    return dispatch(multiViewToSingle(params)).unwrap();
  }
);

export const setupWorkspaceView = createAsyncThunk(
  `${SLICE_NAME}/setupWorkspaceView`,
  async (params: { userId?: string }, { dispatch, getState }) => {
    const { userId } = params;

    const rootState = getState() as RootState;
    const workspaces = getAllSelectedWorkspaces(rootState.workspaceView);
    if (getViewMode(rootState) === ApiClientViewMode.SINGLE) {
      return dispatch(switchContext({ workspace: workspaces[0]!, userId })).unwrap();
    }

    return dispatch(workspaceViewManager({ workspaces, userId, action: "add" })).unwrap();
  }
);
