import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiClientViewMode, WorkspaceState, WorkspaceViewState } from "./types";
import { ReducerKeys } from "store/constants";
import { addWorkspaceIntoView, setupWorkspaceView, switchContext } from "./thunks";
import { RootState } from "store/types";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";
import { NativeError } from "errors/NativeError";
import { ErrorSeverity } from "errors/types";

export const workspaceViewAdapter = createEntityAdapter<WorkspaceState>({
  selectId: (workspace) => workspace.id as string,
});

// selectors
const workspacesSelectors = workspaceViewAdapter.getSelectors<WorkspaceViewState>((s) => s.selectedWorkspaces);

export const getSelectedWorkspaceIds = workspacesSelectors.selectIds;
export const getAllSelectedWorkspaces = workspacesSelectors.selectAll;
export const getSelectedWorkspacesEntities = workspacesSelectors.selectEntities;
export const getSelectedWorkspaceCount = workspacesSelectors.selectTotal;
export const getWorkspaceById = workspacesSelectors.selectById;

export function getIsSelected(state: RootState, id: string) {
  return id in state.workspaceView.selectedWorkspaces.entities;
}

export function getWorkspaceViewSlice(state: RootState) {
  return state.workspaceView;
}

export function getViewMode(state: RootState) {
  return getWorkspaceViewSlice(state).viewMode;
}

const initialState: WorkspaceViewState = {
  isSetupDone: false,
  viewMode: ApiClientViewMode.SINGLE,
  selectedWorkspaces: workspaceViewAdapter.getInitialState(),
};

// slice
export const workspaceViewSlice = createSlice({
  name: ReducerKeys.WORKSPACE_VIEW,
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ApiClientViewMode>) {
      state.viewMode = action.payload;
    },

    addWorkspace(state, action: PayloadAction<WorkspaceState>) {
      workspaceViewAdapter.addOne(state.selectedWorkspaces, action.payload);
    },

    addWorkspaces(state, action: PayloadAction<WorkspaceState[]>) {
      workspaceViewAdapter.addMany(state.selectedWorkspaces, action.payload);
    },

    removeWorkspace(state, action: PayloadAction<WorkspaceState["id"]>) {
      workspaceViewAdapter.removeOne(state.selectedWorkspaces, action.payload as string);
    },

    setWorkspaceStatus(state, action: PayloadAction<{ id: string; status: WorkspaceState["status"] }>) {
      const { id, status } = action.payload;
      workspaceViewAdapter.updateOne(state.selectedWorkspaces, {
        id,
        changes: { status },
      });
    },

    resetToSingleView(state) {
      state.viewMode = ApiClientViewMode.SINGLE;
      workspaceViewAdapter.removeAll(state.selectedWorkspaces);
    },

    reset(state) {
      return initialState;
    },

    // TODO: check hydration
  },
  extraReducers(builder) {
    builder
      .addCase(addWorkspaceIntoView.pending, (state, action) => {
        const { workspace } = action.meta.arg;
        const workspaceState: WorkspaceState = {
          ...workspace,
          status: { loading: true },
        };

        // TODO
        workspaceViewAdapter.addOne(state.selectedWorkspaces, workspaceState);
      })
      .addCase(addWorkspaceIntoView.rejected, (state, action) => {
        const { workspace } = action.meta.arg;

        state.selectedWorkspaces.entities[workspace.id as string] = {
          loading: false,
          state: { success: false, error: new Error(action.error.message) },
        };
      })
      .addCase(addWorkspaceIntoView.fulfilled, (state, action) => {
        const { workspace } = action.meta.arg;

        state.selectedWorkspaces.entities[workspace.id as string].status = {
          loading: false,
          state: { success: true, result: null },
        };
      })
      .addCase(switchContext.rejected, (state, action) => {
        throw new NativeError(action.error.message as string).setShowBoundary(true).setSeverity(ErrorSeverity.FATAL);
      })

      .addCase(setupWorkspaceView.pending, (state) => {
        state.isSetupDone = false;
      })
      .addCase(setupWorkspaceView.rejected, (state, action) => {
        throw new NativeError(action.error.message as string).setShowBoundary(true).setSeverity(ErrorSeverity.FATAL);
      })
      .addCase(setupWorkspaceView.fulfilled, (state) => {
        state.isSetupDone = true;
      });
  },
});

export const workspaceViewActions = workspaceViewSlice.actions;

export const workspaceViewReducerWithLocal = getReducerWithLocalStorageSync(
  ReducerKeys.WORKSPACE_VIEW,
  workspaceViewSlice.reducer,
  ["viewMode", "selectedWorkspaces"]
);
