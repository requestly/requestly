import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiClientViewMode, WorkspaceInfo, WorkspaceState } from "./types";
import { RootState } from "store/types";
import { apiClientContextService } from "./helpers/ApiClientContextService";
import { apiClientContextRegistry } from "./helpers/ApiClientContextRegistry";
import { UserDetails } from "./helpers/ApiClientContextService/ApiClientContextService";
import { ReducerKeys } from "store/constants";
import { reduxStore } from "store";
import { Err, Ok, Result } from "utils/try";
import { getAllSelectedWorkspaces, getSelectedWorkspaceCount, getViewMode, workspaceViewActions } from "./slice";
import { getWorkspaceInfo } from "./utils";
import {
  dummyPersonalWorkspace,
  getWorkspaceById,
  isActiveWorkspaceShared,
  getActiveWorkspace,
} from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import { FAKE_LOGGED_OUT_WORKSPACE_ID } from "../common/constants";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { NativeError } from "errors/NativeError";
import { closeAllTabs, closeTab, tabsAdapter } from "componentsV2/Tabs/slice";

const SLICE_NAME = ReducerKeys.WORKSPACE_VIEW;

type UserAction = "add" | "remove";

function getUserDetails(userId?: string) {
  const userDetails: UserDetails = userId ? { uid: userId, loggedIn: true } : { loggedIn: false };
  return userDetails;
}

async function closeAllTabsAndCheckRejection() {
  const result = await reduxStore.dispatch(closeAllTabs({ skipUnsavedPrompt: true }));

  if (closeAllTabs.rejected.match(result)) {
    return false;
  }

  return true;
}

function getFallbackWorkspaceInfo(rootState: RootState): WorkspaceInfo {
  const fallbackWorkspaceId = rootState.workspaceView.fallbackWorkspaceId;

  if (fallbackWorkspaceId !== null && fallbackWorkspaceId !== undefined) {
    const fallbackWorkspace = getWorkspaceById(fallbackWorkspaceId)(rootState);
    if (!fallbackWorkspace) {
      throw new NativeError("Fallback workspace not found").addContext({ fallbackWorkspaceId });
    }

    return getWorkspaceInfo(fallbackWorkspace);
  }

  return {
    id: dummyPersonalWorkspace.id,
    meta: { type: WorkspaceType.PERSONAL },
  };
}

export const workspaceViewManager = createAsyncThunk(
  `${SLICE_NAME}/workspaceViewManager`,
  async (
    params: { workspaces: WorkspaceInfo[]; action: UserAction; userId?: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const { workspaces, action, userId } = params;
      const rootState = getState() as RootState;
      const viewMode = getViewMode(rootState);

      const activeWorkspace = getActiveWorkspace(rootState);
      dispatch(workspaceViewActions.setFallbackWorkspaceId(activeWorkspace.id));

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
        const ids = workspaces.map((w) => w.id);
        if (viewMode === "MULTI" && remaining === 0) {
          const workspaceToSwitch = getFallbackWorkspaceInfo(rootState);
          return dispatch(switchContext({ workspace: workspaceToSwitch, userId })).unwrap();
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

export const addWorkspaceIntoView = createAsyncThunk(
  `${SLICE_NAME}/addWorkspaceIntoView`,
  async (params: { workspace: WorkspaceInfo; userDetails: UserDetails }) => {
    const { workspace, userDetails } = params;
    return apiClientContextService.createContext(workspace, userDetails);
  }
);

const addWorkspacesIntoMultiView = createAsyncThunk(
  `${SLICE_NAME}/addWorkspacesIntoMultiView`,
  async (params: { workspaces: WorkspaceInfo[]; userId?: string }, { dispatch }) => {
    const { workspaces, userId } = params;
    const userDetails = getUserDetails(userId);
    const results = await Promise.allSettled(
      workspaces.map(async (workspace) => {
        return dispatch(addWorkspaceIntoView({ workspace, userDetails })).unwrap();
      })
    );

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(`Failed to add ${failures.length} workspace(s):`, failures);
      // Optionally show user notification
      // toast.error(`Some workspaces failed to load`);
    }
  }
);

function removeWorkspaceFromView(params: { workspaceId: WorkspaceState["id"] }): Result<null> {
  const { workspaceId } = params;

  try {
    apiClientContextRegistry.removeContext(workspaceId);
    reduxStore.dispatch(workspaceViewActions.removeWorkspace(workspaceId));

    return new Ok(null);
  } catch (error) {
    return new Err(error instanceof Error ? error : new Error(String(error)));
  }
}

const removeWorkspacesFromView = createAsyncThunk<
  PromiseSettledResult<{ workspaceId: WorkspaceState["id"]; result: Result<null, Error> }>[],
  { workspaceIds: WorkspaceState["id"][]; userId?: string },
  { state: RootState }
>(
  `${SLICE_NAME}/removeWorkspacesFromView`,
  async ({ workspaceIds }) => {
    const results = await Promise.allSettled(
      workspaceIds.map((workspaceId) => {
        const result = removeWorkspaceFromView({ workspaceId });
        return { workspaceId, result };
      })
    );

    return results;
  },
  {
    condition: async ({ workspaceIds }) => {
      const currentState = reduxStore.getState();
      const allTabs = tabsAdapter.getSelectors().selectAll(currentState.tabs.tabs);

      const tabsToClose = allTabs.filter((tab) => {
        const tabWorkspaceId = tab.source.metadata.context?.id;
        // @ts-expect-error tabWorkspaceId can be undefined
        return workspaceIds.includes(tabWorkspaceId);
      });

      const results = await Promise.allSettled(
        tabsToClose.map((tab) => reduxStore.dispatch(closeTab({ tabId: tab.id, skipUnsavedPrompt: true })))
      );

      const hasAllSucceeded = results.every((result) => {
        if (result.status === "fulfilled") {
          return closeTab.fulfilled.match(result.value);
        }
        return false;
      });

      return hasAllSucceeded;
    },
  }
);

const singleToMultiView = createAsyncThunk(
  `${SLICE_NAME}/singleToMultiView`,
  async (params: { workspaces: WorkspaceInfo[]; userId?: string }, { dispatch }) => {
    apiClientContextRegistry.clearAll();
    dispatch(workspaceViewActions.resetToMultiView());
    return dispatch(addWorkspacesIntoMultiView(params)).unwrap();
  },
  {
    condition: closeAllTabsAndCheckRejection,
  }
);

export const switchContext = createAsyncThunk(
  `${SLICE_NAME}/switchContext`,
  async (params: { workspace: WorkspaceInfo; userId?: string }, { dispatch, rejectWithValue }) => {
    const { workspace, userId } = params;
    apiClientContextRegistry.clearAll();
    dispatch(workspaceViewActions.resetToSingleView());

    const userDetails = getUserDetails(userId);
    return dispatch(addWorkspaceIntoView({ workspace, userDetails }));
  },
  {
    condition: closeAllTabsAndCheckRejection,
  }
);

async function switchToPrivateWorkspace() {
  const rootState = reduxStore.getState();
  const appMode = getAppMode(rootState);
  const user = getUserAuthDetails(rootState);
  const isSharedWorkspaceMode = isActiveWorkspaceShared(rootState);

  await switchWorkspace(
    {
      teamId: null,
      teamName: dummyPersonalWorkspace.name,
      teamMembersCount: 0,
      workspaceType: WorkspaceType.PERSONAL,
    },
    reduxStore.dispatch,
    {
      isSyncEnabled: user?.details?.isSyncEnabled || false,
      isWorkspaceMode: isSharedWorkspaceMode,
    },
    appMode,
    undefined, // setLoader
    "switch_context_thunk" // source
  );
}

function isWorkspaceDeletedError(error: Error) {
  const errorMessage = error?.message || String(error);
  const message = String(errorMessage).toLowerCase();
  return message.includes("missing or insufficient permissions") || message.includes("failed to initialize fsmanager");
}

// TODO: check how it behaves with redux hydration
export const setupWorkspaceView = createAsyncThunk(
  `${SLICE_NAME}/setupWorkspaceView`,
  async (params: { userId?: string }, { dispatch, getState }) => {
    const { userId } = params;
    const rootState = getState() as RootState;
    const selectedWorkspaces = getAllSelectedWorkspaces(rootState.workspaceView);

    if (!userId) {
      return dispatch(
        switchContext({
          workspace: {
            id: FAKE_LOGGED_OUT_WORKSPACE_ID,
            meta: { type: WorkspaceType.LOCAL_STORAGE },
          },
        })
      ).unwrap();
    }

    if (getViewMode(rootState) === ApiClientViewMode.SINGLE) {
      const selectedWorkspace = (() => {
        const resurrected = selectedWorkspaces[0];
        if (resurrected?.id === FAKE_LOGGED_OUT_WORKSPACE_ID) {
          return;
        }
        return resurrected;
      })();
      if (!selectedWorkspace) {
        const activeWorkspaceId = rootState.workspace.activeWorkspaceIds[0];
        const activeWorkspace = getWorkspaceById(activeWorkspaceId)(rootState);

        if (!activeWorkspaceId || !activeWorkspace || !activeWorkspace.workspaceType) {
          const result = await dispatch(
            switchContext({
              workspace: {
                id: dummyPersonalWorkspace.id,
                meta: { type: WorkspaceType.PERSONAL },
              },
              userId,
            })
          ).unwrap();

          await switchToPrivateWorkspace();
          return result;
        }

        return dispatch(
          switchContext({
            workspace: {
              id: activeWorkspace.id,
              meta:
                activeWorkspace.workspaceType === WorkspaceType.LOCAL
                  ? { type: activeWorkspace.workspaceType, rootPath: activeWorkspace.rootPath }
                  : { type: activeWorkspace.workspaceType },
            },
            userId,
          })
        ).unwrap();
      }

      try {
        const result = await dispatch(
          switchContext({
            workspace: selectedWorkspace,
            userId,
          })
        ).unwrap();

        return result;
      } catch (error) {
        if (isWorkspaceDeletedError(error)) {
          // workspace deleted, fallback to private
          const result = dispatch(
            switchContext({
              workspace: {
                id: dummyPersonalWorkspace.id,
                meta: { type: WorkspaceType.PERSONAL },
              },
              userId,
            })
          ).unwrap();

          await switchToPrivateWorkspace();
          //TODO: Add toast here to communicate to user what happened and why
          return result;
        }

        throw error;
      }
    }

    if (selectedWorkspaces.length === 0) {
      throw new Error("No workspaces are currently selected in multi-view mode");
    }

    return dispatch(workspaceViewManager({ workspaces: selectedWorkspaces, userId, action: "add" })).unwrap();
  },
  {
    condition: closeAllTabsAndCheckRejection,
  }
);

export const resetWorkspaceView = createAsyncThunk(
  `${SLICE_NAME}/resetWorkspaceView`,
  async (_, { dispatch }) => {
    apiClientContextRegistry.clearAll();
    dispatch(workspaceViewActions.reset());
  },
  {
    condition: closeAllTabsAndCheckRejection,
  }
);
