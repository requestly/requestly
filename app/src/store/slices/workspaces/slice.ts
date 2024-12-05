import { createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { Workspace } from "features/workspaces/types";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

export interface WorkspaceSliceState {
  allWorkspaces?: EntityState<Workspace>;
  activeWorkspaceIds?: string[];
}

export const workspacesEntityAdapter = createEntityAdapter<Workspace>({
  selectId: (workspace) => workspace.id,
  sortComparer: (a, b) => {
    return a?.createdAt >= b?.createdAt ? 1 : -1;
  },
});

const initialState: WorkspaceSliceState = {
  allWorkspaces: workspacesEntityAdapter.getInitialState(),
  activeWorkspaceIds: [],
};

const slice = createSlice({
  name: ReducerKeys.WORKSPACE,
  initialState,
  reducers: {
    resetState: () => initialState,

    setAllWorkspaces: (state: WorkspaceSliceState, action: PayloadAction<Workspace[]>) => {
      workspacesEntityAdapter.setAll(state.allWorkspaces, action.payload);
    },

    setActiveWorkspaceIds: (state: WorkspaceSliceState, action: PayloadAction<string[]>) => {
      state.activeWorkspaceIds = action.payload;
    },
  },
});
const { actions, reducer: workspaceReducer } = slice;

export const workspaceReducerWithLocal = getReducerWithLocalStorageSync(ReducerKeys.WORKSPACE, workspaceReducer, [
  "allWorkspaces",
  "activeWorkspaceIds",
]);

export const workspaceActions = actions;
