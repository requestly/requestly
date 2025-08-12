import { WorkspaceType } from "features/workspaces/types";
import { NativeError } from "errors/NativeError";
import { create, StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";

export enum ApiClientViewMode {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

export type RenderableWorkspaceState = {
  id: string;
  name: string;
  type: WorkspaceType.LOCAL;

  state:
    | { loading: false; errored: true; error: string }
    | { loading: true; errored: false }
    | { loading: false; errored: false };

  setState(state: RenderableWorkspaceState["state"]): void;
};

type ApiClientMultiWorkspaceViewState = {
  viewMode: ApiClientViewMode;
  selectedWorkspaces: StoreApi<RenderableWorkspaceState>[];

  setViewMode(mode: ApiClientViewMode): void;
  addWorkspace(workspace: Omit<RenderableWorkspaceState, "setState" | "state">): void;
  removeWorkspace(id: RenderableWorkspaceState["id"]): void;
  getSelectedWorkspace(id: RenderableWorkspaceState["id"]): StoreApi<RenderableWorkspaceState> | null;
  setStateForSelectedWorkspace(id: RenderableWorkspaceState["id"], state: RenderableWorkspaceState["state"]): void;
};

function createRenderableWorkspaceStore(workspace: Omit<RenderableWorkspaceState, "setState" | "state">) {
  return create<RenderableWorkspaceState>()((set, get) => {
    return {
      id: workspace.id,
      name: workspace.name,
      type: workspace.type,
      state: { loading: false, errored: false },

      setState(state) {
        set({ state });
      },
    };
  });
}

function createApiClientMultiWorkspaceViewStore() {
  return create<ApiClientMultiWorkspaceViewState>()((set, get) => {
    return {
      viewMode: ApiClientViewMode.SINGLE, // TODO: update it when app is restarted
      selectedWorkspaces: [],

      setViewMode(mode) {
        set({ viewMode: mode });
      },

      addWorkspace(workspace) {
        const { selectedWorkspaces } = get();
        set({ selectedWorkspaces: [...selectedWorkspaces, createRenderableWorkspaceStore(workspace)] });
      },

      removeWorkspace(id) {
        const { selectedWorkspaces } = get();

        const updatedWorkspaces = selectedWorkspaces.filter((w) => w.getState().id !== id);
        if (selectedWorkspaces.length === updatedWorkspaces.length) {
          return;
        }

        set({ selectedWorkspaces: updatedWorkspaces });
      },

      getSelectedWorkspace(id) {
        const { selectedWorkspaces } = get();
        return selectedWorkspaces.find((w) => w.getState().id === id) || null;
      },
      setStateForSelectedWorkspace(id, state) {
        const { selectedWorkspaces } = get();

        const workspaceStore = selectedWorkspaces.find((w) => w.getState().id === id);
        if (!workspaceStore) {
          throw new NativeError("Workspace not found!").addContext({ workspaceId: id });
        }

        workspaceStore.getState().setState(state);
      },
    };
  });
}

export const apiClientMultiWorkspaceViewStore = createApiClientMultiWorkspaceViewStore();

export function useApiClientMultiWorkspaceView<T>(selector: (state: ApiClientMultiWorkspaceViewState) => T) {
  return useStore(apiClientMultiWorkspaceViewStore, useShallow(selector));
}

export function useWorkspace<T>(
  workspaceId: RenderableWorkspaceState["id"],
  selector: (state: RenderableWorkspaceState) => T
) {
  const workspaces = apiClientMultiWorkspaceViewStore.getState().selectedWorkspaces;

  const workspaceStore = workspaces.find((w) => w.getState().id === workspaceId);

  if (!workspaceStore) {
    throw new NativeError("Workspace not found!").addContext({ workspaceId });
  }

  return useStore(workspaceStore, useShallow(selector));
}
