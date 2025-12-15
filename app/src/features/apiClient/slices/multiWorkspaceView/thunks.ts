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
import { defaultPersonalWorkspace } from "store/slices/workspaces/selectors";

const SLICE_NAME = ReducerKeys.MULTI_WORKSPACE_VIEW;

type UserAction = "add" | "remove";

export const workspaceViewManager = createAsyncThunk<
  void,
  { workspaces: Workspace[]; action: UserAction; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/workspaceViewManager`, async (params, { dispatch, getState, rejectWithValue }) => {
  try {
    const { workspaces, action, userId } = params;
    const viewMode = getViewMode(getState());

    if (action === "add") {
      if (viewMode === "SINGLE") {
        dispatch(singleToMultiView({ workspaces, userId }));
        return;
      }

      if (viewMode === "MULTI") {
        dispatch(addWorkspacesIntoMultiView({ workspaces, userId }));
        return;
      }
    }

    if (action === "remove") {
      const selectedWorkspacesCount = getSelectedWorkspaceCount(getState().multiWorkspaceView);
      const remaining = selectedWorkspacesCount - workspaces.length;

      if (viewMode === "MULTI" && remaining === 0) {
        dispatch(multiViewToSingle({ userId }));
        return;
      }

      if (viewMode === "MULTI" && remaining >= 1) {
        const ids = workspaces.map((w) => w.id!);
        dispatch(removeWorkspacesFromView({ workspaceIds: ids, userId }));
        return;
      }
    }
  } catch (error) {
    // TODO: handle error
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return rejectWithValue(errorMessage);
  }
});

function getUserDetails(userId?: string) {
  const userDetails: UserDetails = userId ? { uid: userId, loggedIn: true } : { loggedIn: false };
  return userDetails;
}

async function _addWorkspaceIntoView(params: {
  workspace: Workspace;
  userDetails: UserDetails;
}): Promise<Result<null>> {
  const { workspace, userDetails } = params;

  try {
    reduxStore.dispatch(
      multiWorkspaceViewSlice.actions.addWorkspace({
        id: workspace.id!,
        state: { loading: true },
      })
    );

    await apiClientContextService.createContext(workspace, userDetails);

    reduxStore.dispatch(
      multiWorkspaceViewSlice.actions.addWorkspace({
        id: workspace.id!,
        state: { loading: false, state: { success: true, result: null } },
      })
    );

    return new Ok(null);
  } catch (error) {
    return new Err(error);
  }
}

const addWorkspacesIntoMultiView = createAsyncThunk<
  { workspace: Workspace; result: Result<null, Error> }[],
  { workspaces: Workspace[]; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/addWorkspacesIntoMultiView`, async ({ workspaces, userId }) => {
  const userDetails = getUserDetails(userId);

  const results = await Promise.all(
    workspaces.map(async (workspace) => {
      const result = await _addWorkspaceIntoView({ workspace, userDetails });
      return { workspace, result };
    })
  );

  return results;
});

async function _removeWorkspaceFromView(params: { workspaceId: string }): Promise<Result<null>> {
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
  { workspaceId: string; result: Result<null, Error> }[],
  { workspaceIds: string[]; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/removeWorkspacesFromView`, async ({ workspaceIds, userId }, { getState }) => {
  const results = await Promise.all(
    workspaceIds.map(async (workspaceId) => {
      const result = await _removeWorkspaceFromView({ workspaceId });
      return { workspaceId, result };
    })
  );

  return results;
});

const singleToMultiView = createAsyncThunk<
  { workspace: Workspace; result: Result<null, Error> }[],
  { workspaces: Workspace[]; userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/singleToMultiView`, async ({ workspaces, userId }, { dispatch }) => {
  getTabServiceActions().resetTabs(true);
  apiClientContextRegistry.clearAll();
  dispatch(multiWorkspaceViewSlice.actions.setViewMode(ApiClientViewMode.MULTI));

  const action = await dispatch(addWorkspacesIntoMultiView({ workspaces, userId }));

  if (addWorkspacesIntoMultiView.fulfilled.match(action)) {
    return action.payload;
  }

  return [];
});

const multiViewToSingle = createAsyncThunk<
  { workspace: Workspace; result: Result<null, Error> },
  { userId?: string },
  { state: RootState }
>(`${SLICE_NAME}/multiViewToSingle`, async ({ userId }, { dispatch }) => {
  // TODO: to be updated after tabs migration
  getTabServiceActions().resetTabs(true);
  apiClientContextRegistry.clearAll();
  dispatch(multiWorkspaceViewActions.resetToSingleView());

  const userDetails = getUserDetails(userId);
  const result = await _addWorkspaceIntoView({ workspace: defaultPersonalWorkspace, userDetails });
  return { workspace: defaultPersonalWorkspace, result };
});

// TODO:
// export const loadWorkspaces = createAsyncThunk<
//   PromiseSettledResult<string | null>[],
//   { userId?: string },
//   { state: RootState }
// >(`${SLICE_NAME}/loadWorkspaces`, async (payload, { dispatch, getState }) => {
//   const { userId } = payload;
// });
