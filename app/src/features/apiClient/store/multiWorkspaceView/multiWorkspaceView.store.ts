import { WorkspaceType } from "features/workspaces/types";
import { NativeError } from "errors/NativeError";
import { create, StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";

enum ApiClientViewMode {
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

  addWorkspace(workspace: Omit<RenderableWorkspaceState, "setState" | "state">): void;
  removeWorkspace(id: RenderableWorkspaceState["id"]): void;
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
      viewMode: get().selectedWorkspaces.length > 0 ? ApiClientViewMode.MULTI : ApiClientViewMode.SINGLE,
      selectedWorkspaces: [],

      addWorkspace(workspace) {
        const { selectedWorkspaces } = get();
        set({ selectedWorkspaces: [...selectedWorkspaces, createRenderableWorkspaceStore(workspace)] });
      },

      removeWorkspace(id) {
        const { selectedWorkspaces } = get();

        const workspace = selectedWorkspaces.find((w) => w.getState().id === id);
        if (!workspace) {
          throw new NativeError("Workspace not found!").addContext({ workspaceId: id });
        }

        set({ selectedWorkspaces: selectedWorkspaces.filter((w) => w.getState().id !== id) });
      },
    };
  });
}

export const apiClientMultiWorkspaceViewStore = createApiClientMultiWorkspaceViewStore();

export function useApiClientMultiWorkspaceViewStore<T>(selector: (state: ApiClientMultiWorkspaceViewState) => T) {
  return useStore(apiClientMultiWorkspaceViewStore, useShallow(selector));
}

export function useWorkspaceStore<T>(
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
