import { Workspace, WorkspaceType } from "features/workspaces/types";
import { NativeError } from "errors/NativeError";
import { create, StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { persist } from "zustand/middleware";
import * as Sentry from "@sentry/react";

export enum ApiClientViewMode {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

export type RenderableWorkspaceState = {
  id: string;
  name: string;
  type: WorkspaceType.LOCAL;
  rawWorkspace: Workspace;

  state:
    | { loading: false; errored: true; error: string }
    | { loading: true; errored: false }
    | { loading: false; errored: false };

  setState(state: RenderableWorkspaceState["state"]): void;
};

type ApiClientMultiWorkspaceViewState = {
  viewMode: ApiClientViewMode;
  selectedWorkspaces: StoreApi<RenderableWorkspaceState>[];
  isLoaded: boolean;

  setIsLoaded: (flag: boolean) => void;
  setViewMode(mode: ApiClientViewMode): void;
  addWorkspace(workspace: Omit<RenderableWorkspaceState, "setState" | "state">): void;
  removeWorkspace(id: RenderableWorkspaceState["id"]): void;
  getSelectedWorkspace(id: RenderableWorkspaceState["id"]): StoreApi<RenderableWorkspaceState> | null;
  setStateForSelectedWorkspace(id: RenderableWorkspaceState["id"], state: RenderableWorkspaceState["state"]): void;
  isSelected(id: RenderableWorkspaceState["id"]): boolean;
  getViewMode: () => ApiClientViewMode;
  getAllSelectedWorkspaces: () => StoreApi<RenderableWorkspaceState>[];
};

function createRenderableWorkspaceStore(workspace: Omit<RenderableWorkspaceState, "setState" | "state">) {
  return create<RenderableWorkspaceState>()((set, _) => {
    return {
      id: workspace.id,
      name: workspace.name,
      type: workspace.type,
      rawWorkspace: workspace.rawWorkspace,
      state: { loading: false, errored: false },

      setState(state) {
        set({ state });
      },
    };
  });
}

function createApiClientMultiWorkspaceViewStore() {
  return create<ApiClientMultiWorkspaceViewState>()(
    persist(
      (set, get) => {
        return {
          viewMode: ApiClientViewMode.SINGLE,
          isLoaded: false,
          selectedWorkspaces: [] as StoreApi<RenderableWorkspaceState>[],

          setViewMode(mode) {
            set({ viewMode: mode });
          },

          setIsLoaded(flag) {
            set({
              isLoaded: flag,
            });
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

          isSelected(id) {
            return get().selectedWorkspaces.some((w) => w.getState().id === id);
          },

          getViewMode() {
            return get().viewMode;
          },

          getAllSelectedWorkspaces() {
            const { selectedWorkspaces } = get();
            return selectedWorkspaces;
          },
        };
      },
      {
        name: "rq_multi_workspace_state",
        onRehydrateStorage() {
          return (store, error) => {
            if (error) {
              Sentry.withScope((scope) => {
                scope.setTag("error_type", "multi_workspace_view_rehydration_failed");
                scope.setContext("context", {
                  tabServiceStore: store,
                });
                Sentry.captureException(new Error(`Multi Workspace view rehydration failed - error:${error}`));
              });
            }
          };
        },
        storage: {
          setItem(name, value) {
            const { viewMode, selectedWorkspaces } = value.state;
            const serializableObject = {
              ...value,
              state: {
                ...value.state,
                viewMode,
                selectedWorkspaces: selectedWorkspaces.map((s) => {
                  const state = s.getState();
                  return state;
                }),
              },
            };

            localStorage.setItem(name, JSON.stringify(serializableObject));
          },
          getItem(name) {
            const stateString = localStorage.getItem(name);
            if (!stateString) {
              return null;
            }
            const existingValue = JSON.parse(stateString);
            const rawObject = existingValue as {
              state: {
                viewMode: ApiClientViewMode;
                selectedWorkspaces: Omit<RenderableWorkspaceState, "setState" | "state">[];
              };
            };
            const { viewMode, selectedWorkspaces: rawSelectedWorkspaces } = rawObject.state;

            const selectedWorkspaces = rawSelectedWorkspaces.map((s) => createRenderableWorkspaceStore(s));

            return {
              ...existingValue,
              state: {
                ...existingValue.state,
                viewMode,
                isLoaded: false,
                selectedWorkspaces,
              },
            };
          },
          removeItem(name) {
            localStorage.removeItem(name);
          },
        },
      }
    )
  );
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
