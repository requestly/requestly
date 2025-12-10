import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiClientViewMode, MultiWorkspaceViewState, WorkspaceState, WorkspaceViewState } from "./types";

export const multiWorkspaceViewAdapter = createEntityAdapter<WorkspaceViewState>({
  selectId: (workspace) => workspace.id,
});

const initialState: MultiWorkspaceViewState = {
  viewMode: ApiClientViewMode.SINGLE,
  selectedWorkspaces: multiWorkspaceViewAdapter.getInitialState(),
};

export const multiWorkspaceViewSlice = createSlice({
  name: "multiWorkspaceView",
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ApiClientViewMode>) {
      state.viewMode = action.payload;
    },

    addWorkspace(state, action: PayloadAction<WorkspaceViewState["id"]>) {
      const id = action.payload;

      if (state.selectedWorkspaces.entities[id]) {
        console.log("workspace already added!");
        return;
      }

      multiWorkspaceViewAdapter.addOne(state.selectedWorkspaces, {
        id,
        state: { loading: false, errored: false },
      });
    },

    removeWorkspace(state, action: PayloadAction<WorkspaceViewState["id"]>) {
      multiWorkspaceViewAdapter.removeOne(state.selectedWorkspaces, action.payload);
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
