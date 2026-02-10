import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiClientViewMode, WorkspaceInfo, WorkspaceState, WorkspaceViewState } from "./types";
import { ReducerKeys } from "store/constants";
import { addWorkspaceIntoView, setupWorkspaceView, switchContext } from "./thunks";
import { RootState } from "store/types";
import { NativeError } from "errors/NativeError";
import { ErrorSeverity } from "errors/types";
import { InvalidContextVersionError } from "./helpers/ApiClientContextRegistry/ApiClientContextRegistry";
import { persistReducer } from "redux-persist";
import { getPersistConfig } from "redux-deep-persist";
import storage from "redux-persist/lib/storage";

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

    setFallbackWorkspaceId(state, action: PayloadAction<WorkspaceState["id"]>) {
      state.fallbackWorkspaceId = action.payload;
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

    resetToMultiView(state) {
      state.viewMode = ApiClientViewMode.MULTI;
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

        workspaceViewAdapter.addOne(state.selectedWorkspaces, {
          ...workspace,
          status: { loading: true },
        });
      })
      .addCase(addWorkspaceIntoView.rejected, (state, action) => {
        const { workspace } = action.meta.arg;
        const id = workspace.id as string;

        if (action.error.name === InvalidContextVersionError.name) {
          return;
        }

        const error = new Error(action.error.message);
        error.stack = action.error.stack;

        workspaceViewAdapter.updateOne(state.selectedWorkspaces, {
          id,
          changes: {
            status: {
              loading: false,
              state: { success: false, error },
            },
          },
        });
      })
      .addCase(addWorkspaceIntoView.fulfilled, (state, action) => {
        const { workspace } = action.meta.arg;
        const id = workspace.id as string;

        workspaceViewAdapter.updateOne(state.selectedWorkspaces, {
          id,
          changes: {
            status: {
              loading: false,
              state: { success: true, result: null },
            },
          },
        });
      })
      .addCase(switchContext.rejected, (state, action) => {
        if (action.error.name === InvalidContextVersionError.name) {
          return;
        }

        throw new NativeError(action.error.message as string)
          .setShowBoundary(true)
          .setSeverity(ErrorSeverity.FATAL)
          .set("stack", action.error.stack);
      })
      .addCase(setupWorkspaceView.pending, (state) => {
        state.isSetupDone = false;
      })
      .addCase(setupWorkspaceView.rejected, (state, action) => {
        if (action.error.name === InvalidContextVersionError.name) {
          return;
        }

        throw new NativeError(action.error.message as string)
          .setShowBoundary(true)
          .setSeverity(ErrorSeverity.FATAL)
          .set("stack", action.error.stack);
      })
      .addCase(setupWorkspaceView.fulfilled, (state) => {
        state.isSetupDone = true;
      });
  },
});

export const workspaceViewActions = workspaceViewSlice.actions;

const workspaceViewPersistConfig = getPersistConfig({
  storage,
  key: ReducerKeys.WORKSPACE_VIEW,
  rootReducer: workspaceViewSlice.reducer,
  whitelist: ["viewMode", "selectedWorkspaces"],
  transforms: [
    {
      in: (state: WorkspaceViewState) => {
        if (!state?.selectedWorkspaces?.entities) return state;

        // Transform WorkspaceState to WorkspaceInfo (strip status)
        const sanitizedEntities: Record<string, WorkspaceInfo> = {};
        Object.entries(state.selectedWorkspaces.entities).forEach(([id, workspace]) => {
          if (workspace) {
            sanitizedEntities[id] = {
              id: workspace.id,
              meta: workspace.meta,
            };
          }
        });

        return {
          ...state,
          selectedWorkspaces: {
            ...state.selectedWorkspaces,
            entities: sanitizedEntities,
          },
        };
      },
      out: (state: WorkspaceViewState) => {
        if (!state?.selectedWorkspaces?.entities) return state;

        // Rehydrate with default status
        const rehydratedEntities: Record<string, WorkspaceState> = {};
        Object.entries(state.selectedWorkspaces.entities).forEach(([id, workspaceInfo]) => {
          if (workspaceInfo && workspaceInfo.id) {
            rehydratedEntities[id] = {
              ...workspaceInfo,
              status: { loading: false, state: { success: true, result: null } },
            } as WorkspaceState;
          }
        });

        return {
          ...state,
          selectedWorkspaces: {
            ...state.selectedWorkspaces,
            entities: rehydratedEntities,
          },
        };
      },
    },
  ],
});

export const workspaceViewReducerWithLocal = persistReducer(workspaceViewPersistConfig, workspaceViewSlice.reducer);
