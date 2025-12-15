import { createAsyncThunk } from "@reduxjs/toolkit";
import { Workspace } from "features/workspaces/types";
import { multiWorkspaceViewActions, multiWorkspaceViewSlice } from "./multiWorkspaceViewSlice";
import { ApiClientViewMode } from "./types";
import { getSelectedWorkspaceCount, getViewMode } from "./selectors";
import { RootState } from "store/types";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { apiClientContextService } from "./helpers/ApiClientContextService";
import { apiClientContextRegistry } from "./helpers/ApiClientContextRegistry";
import { UserDetails } from "./helpers/ApiClientContextService/ApiClientContextService";
import { ReducerKeys } from "store/constants";
import { reduxStore } from "store";
import { Err, Ok, Result } from "utils/try";

const SLICE_NAME = ReducerKeys.MULTI_WORKSPACE_VIEW;

type UserAction = "add" | "remove";

export const workspaceViewManager = createAsyncThunk(
  `${SLICE_NAME}/workspaceViewManager`,
  async (
    params: { workspaces: Workspace[]; action: UserAction; userId?: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const { workspaces, action, userId } = params;
      const viewMode = getViewMode(getState() as RootState);

      if (action === "add") {
        if (viewMode === "SINGLE") {
          return dispatch(singleToMultiView({ workspaces, userId }));
        }

        if (viewMode === "MULTI") {
          return dispatch(addWorkspacesIntoMultiView({ workspaces, userId }));
        }
      }

      if (action === "remove") {
        const selectedWorkspacesCount = getSelectedWorkspaceCount((getState() as RootState).multiWorkspaceView);
        const remaining = selectedWorkspacesCount - workspaces.length;
        const ids = workspaces.map((w) => w.id!);

        if (viewMode === "MULTI" && remaining === 0) {
          const lastUncheckedWorkspace = workspaces[workspaces.length - 1];
          return dispatch(multiViewToSingle({ workspace: lastUncheckedWorkspace, userId }));
        }

        if (viewMode === "MULTI" && remaining >= 1) {
          return dispatch(removeWorkspacesFromView({ workspaceIds: ids, userId }));
        }
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

function getUserDetails(userId?: string) {
  const userDetails: UserDetails = userId ? { uid: userId, loggedIn: true } : { loggedIn: false };
  return userDetails;
}

async function addWorkspaceIntoView(params: { workspace: Workspace; userDetails: UserDetails }): Promise<Result<null>> {
  const { workspace, userDetails } = params;

  reduxStore.dispatch(
    multiWorkspaceViewSlice.actions.addWorkspace({
      id: workspace.id!,
      state: { loading: true },
    })
  );

  const result = await apiClientContextService.createContext(workspace, userDetails);

  reduxStore.dispatch(
    multiWorkspaceViewSlice.actions.addWorkspace({
      id: workspace.id!,
      state: result.isError()
        ? { loading: false, state: { success: false, error: result.unwrapError() } }
        : { loading: false, state: { success: true, result: null } },
    })
  );

  return result.isError() ? result : new Ok(null);
}

const addWorkspacesIntoMultiView = createAsyncThunk<
  PromiseSettledResult<{ workspace: Workspace; result: Result<null, Error> }>[],
  { workspaces: Workspace[]; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/addWorkspacesIntoMultiView`, async ({ workspaces, userId }) => {
  const userDetails = getUserDetails(userId);

  const results = await Promise.allSettled(
    workspaces.map(async (workspace) => {
      const result = await addWorkspaceIntoView({ workspace, userDetails });
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
    reduxStore.dispatch(multiWorkspaceViewSlice.actions.removeWorkspace(workspaceId));

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
  async (params: { workspaces: Workspace[]; userId?: string }, { dispatch }) => {
    getTabServiceActions().resetTabs(true);
    apiClientContextRegistry.clearAll();
    dispatch(multiWorkspaceViewSlice.actions.setViewMode(ApiClientViewMode.MULTI));

    return dispatch(addWorkspacesIntoMultiView(params));
  }
);

const multiViewToSingle = createAsyncThunk<
  { workspace: Workspace; result: Result<null, Error> },
  { workspace: Workspace; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/multiViewToSingle`, async ({ workspace, userId }, { dispatch, getState }) => {
  // TODO: to be updated after tabs migration
  getTabServiceActions().resetTabs(true);
  apiClientContextRegistry.clearAll();
  dispatch(multiWorkspaceViewActions.resetToSingleView());

  const userDetails = getUserDetails(userId);
  const result = await addWorkspaceIntoView({ workspace, userDetails });
  return { workspace, result };
});

export const switchContext = createAsyncThunk(
  `${SLICE_NAME}/switchContext`,
  async (params: { workspace: Workspace; userId?: string }, { dispatch }) => {
    return dispatch(multiViewToSingle(params));
  }
);

// TODO:
// export const loadWorkspaces = createAsyncThunk<
//   PromiseSettledResult<string | null>[],
//   { userId?: string },
//   { state: RootState }
// >(`${SLICE_NAME}/loadWorkspaces`, async (payload, { dispatch, getState }) => {
//   const { userId } = payload;
// });
