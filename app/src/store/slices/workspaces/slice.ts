import { createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { Workspace } from "features/workspaces/types";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

export interface WorkspaceSliceState {
  allWorkspaces?: EntityState<Workspace>;
  isWorkspacesFetched?: boolean;
  activeWorkspaceIds?: string[];
  activeWorkspacesMembers?: Record<string, any>;
}

export const workspacesEntityAdapter = createEntityAdapter<Workspace>({
  selectId: (workspace) => workspace.id,
  sortComparer: (a, b) => {
    return a?.createdAt >= b?.createdAt ? 1 : -1;
  },
});

const initialState: WorkspaceSliceState = {
  allWorkspaces: workspacesEntityAdapter.getInitialState(),
  isWorkspacesFetched: false,
  activeWorkspaceIds: [],
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
    setWorkspacesFetched: (state: WorkspaceSliceState, action: PayloadAction<boolean>) => {
      state.isWorkspacesFetched = action.payload;
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
