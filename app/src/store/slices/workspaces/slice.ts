import { createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { Workspace } from "features/workspaces/types";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

export interface WorkspaceSliceState {
  allWorkspaces?: EntityState<Workspace>;
  workspacesUpdatedAt?: number;
  activeWorkspaceIds?: string[];
  activeWorkspacesMembers?: Record<string, any>;
}

export const workspacesEntityAdapter = createEntityAdapter<Workspace>({
  selectId: (workspace) => workspace.id,
  sortComparer: (a, b) => {
    return a?.createdAt >= b?.createdAt ? 1 : -1;
  },
});

const getTeamSliceCurrentWorkspaceId = () => {
  const teamsSlice = window.localStorage.getItem("persist:teams");
  if (teamsSlice) {
    try {
      const teamsSliceObj = JSON.parse(teamsSlice);
      const teamsSliceCurrentlyActiveWorkspace = teamsSliceObj?.currentlyActiveWorkspace
        ? JSON.parse(teamsSliceObj?.currentlyActiveWorkspace)
        : {};
      // console.log("Migrated Successfully", { teamsSliceObj, teamsSliceCurrentlyActiveWorkspace });

      // For backward compatibility in case of any issues. Uncomment when everything is working fine along with all the reducers usage of teams/slice.ts
      // window.localStorage.removeItem("persist:teams");
      return teamsSliceCurrentlyActiveWorkspace?.id ? [teamsSliceCurrentlyActiveWorkspace?.id] : [];
    } catch (e) {
      console.log("Error while migration teams slice to workspaces slice");
      return [];
    }
  } else {
    // console.log("Already Migrated or New User");
    return [];
  }
};

const initialState: WorkspaceSliceState = {
  allWorkspaces: workspacesEntityAdapter.getInitialState(),
  workspacesUpdatedAt: 0,
  activeWorkspaceIds: getTeamSliceCurrentWorkspaceId(),
  activeWorkspacesMembers: {},
};

const slice = createSlice({
  name: ReducerKeys.WORKSPACE,
  initialState,
  reducers: {
    resetState: () => initialState,

    setAllWorkspaces: (state: WorkspaceSliceState, action: PayloadAction<Workspace[]>) => {
      workspacesEntityAdapter.setAll(state.allWorkspaces, action.payload);
    },
    upsertWorkspace: (state: WorkspaceSliceState, action: PayloadAction<Workspace>) => {
      workspacesEntityAdapter.upsertOne(state.allWorkspaces, action.payload);
    },
    setWorkspacesUpdatedAt: (state: WorkspaceSliceState, action: PayloadAction<number>) => {
      state.workspacesUpdatedAt = action.payload;
    },

    setActiveWorkspaceIds: (state: WorkspaceSliceState, action: PayloadAction<string[]>) => {
      state.activeWorkspaceIds = action.payload;
    },
    removeActiveWorkspaceId: (state: WorkspaceSliceState, action: PayloadAction<string>) => {
      state.activeWorkspaceIds = state.activeWorkspaceIds?.filter((id) => id !== action.payload);
    },

    setActiveWorkspacesMembers: (
      state: WorkspaceSliceState,
      action: PayloadAction<WorkspaceSliceState["activeWorkspacesMembers"]>
    ) => {
      state.activeWorkspacesMembers = action.payload;
    },
    updateActiveWorkspacesMembers: (
      state: WorkspaceSliceState,
      action: PayloadAction<WorkspaceSliceState["activeWorkspacesMembers"]>
    ) => {
      state.activeWorkspacesMembers = {
        ...state.activeWorkspacesMembers,
        ...action.payload,
      };
    },
  },
});
const { actions, reducer: workspaceReducer } = slice;

export const workspaceReducerWithLocal = getReducerWithLocalStorageSync(ReducerKeys.WORKSPACE, workspaceReducer, [
  "allWorkspaces",
  "isWorkspacesFetched",
  "activeWorkspaceIds",
]);

export const workspaceActions = actions;
