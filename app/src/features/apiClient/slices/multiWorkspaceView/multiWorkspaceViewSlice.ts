import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiClientViewMode, MultiWorkspaceViewState, WorkspaceState, WorkspaceViewState } from "./types";
import { ReducerKeys } from "store/constants";

export const multiWorkspaceViewAdapter = createEntityAdapter<WorkspaceViewState>({
  selectId: (workspace) => workspace.id,
});

const initialState: MultiWorkspaceViewState = {
  viewMode: ApiClientViewMode.SINGLE,
  selectedWorkspaces: multiWorkspaceViewAdapter.getInitialState(),
};

export const multiWorkspaceViewSlice = createSlice({
  name: ReducerKeys.MULTI_WORKSPACE_VIEW,
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ApiClientViewMode>) {
      state.viewMode = action.payload;
    },

    addWorkspace(state, action: PayloadAction<WorkspaceViewState>) {
      const id = action.payload.id;

      if (state.selectedWorkspaces.entities[id]) {
        return;
      }

      multiWorkspaceViewAdapter.addOne(state.selectedWorkspaces, action.payload);
    },

    addWorkspaces(state, action: PayloadAction<WorkspaceViewState[]>) {
      multiWorkspaceViewAdapter.addMany(state.selectedWorkspaces, action.payload);
    },

    removeWorkspace(state, action: PayloadAction<WorkspaceViewState["id"]>) {
      multiWorkspaceViewAdapter.removeOne(state.selectedWorkspaces, action.payload);
    },

    removeWorkspaces(state, action: PayloadAction<WorkspaceViewState["id"][]>) {
      multiWorkspaceViewAdapter.removeMany(state.selectedWorkspaces, action.payload);
    },

    setWorkspaceState(state, action: PayloadAction<{ id: WorkspaceViewState["id"]; workspaceState: WorkspaceState }>) {
      const { id, workspaceState } = action.payload;
      multiWorkspaceViewAdapter.updateOne(state.selectedWorkspaces, {
        id,
        changes: { state: workspaceState },
      });
    },

    resetToSingleView(state) {
      state.viewMode = ApiClientViewMode.SINGLE;
      multiWorkspaceViewAdapter.removeAll(state.selectedWorkspaces);
    },

    // TODO: check hydration
  },
});

export const multiWorkspaceViewActions = multiWorkspaceViewSlice.actions;
export const multiWorkspaceViewReducer = multiWorkspaceViewSlice.reducer;
