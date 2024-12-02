import { createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { Workspace } from "features/workspaces/types";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

export interface WorkspaceSliceState {
  activeWorkspaceId?: string;
  allWorkspaces?: EntityState<Workspace>;
}

export const workspacesEntityAdapter = createEntityAdapter<Workspace>({
  selectId: (workspace) => workspace.id,
  sortComparer: (a, b) => {
    return a?.createdAt >= b?.createdAt ? 1 : -1;
  },
});

const initialState: WorkspaceSliceState = {
  activeWorkspaceId: undefined,
  allWorkspaces: workspacesEntityAdapter.getInitialState(),
};

const slice = createSlice({
  name: ReducerKeys.WORKSPACE,
  initialState,
  reducers: {
    resetState: () => initialState,

    setAllWorkspaces: (state: WorkspaceSliceState, action: PayloadAction<Workspace[]>) => {
      workspacesEntityAdapter.setAll(state.allWorkspaces, action.payload);
    },

    setActiveWorkspaceId: (
      state: WorkspaceSliceState,
      action: PayloadAction<WorkspaceSliceState["activeWorkspaceId"]>
    ) => {
      state.activeWorkspaceId = action.payload;
    },
  },
});
const { actions, reducer: workspaceReducer } = slice;

export const workspaceReducerWithLocal = getReducerWithLocalStorageSync(ReducerKeys.WORKSPACE, workspaceReducer, [
  "activeWorkspaceId",
  "allWorkspaces",
]);

export const workspaceActions = actions;
