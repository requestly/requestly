import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { AllApiClientStores } from "../apiRecords/ApiRecordsContextProvider";
import { RenderableWorkspaceState } from "../multiWorkspaceView/multiWorkspaceView.store";
import { create, useStore } from "zustand";
import { NativeError } from "errors/NativeError";
import { useShallow } from "zustand/shallow";
import { immer } from "zustand/middleware/immer";

export const _SINGLE_MODE_WORKSPACE_CONTEXT_ID = "single_mode_workspace_context";

export type ApiClientFeatureContext = {
  id: RenderableWorkspaceState["id"];
  workspaceId: RenderableWorkspaceState["id"];
  stores: AllApiClientStores;
  repositories: ApiClientRepositoryInterface;
};

type ApiClientFeatureContextProviderState = {
  contexts: Map<RenderableWorkspaceState["id"], ApiClientFeatureContext>;

  addContext(context: ApiClientFeatureContext): void;
  removeContext(id: RenderableWorkspaceState["id"]): void;
  getContext(id: RenderableWorkspaceState["id"]): ApiClientFeatureContext | undefined;
  getSingleViewContext(): ApiClientFeatureContext;
};

function createApiClientFeatureContextProviderStore() {
  return create<ApiClientFeatureContextProviderState>()(
    immer((set, get) => {
      return {
        contexts: new Map(),

        addContext(context) {
          set((state) => {
            state.contexts.set(context.id, context);
          });
        },

        removeContext(id) {
          const { contexts } = get();
          const context = contexts.get(id);

          if (!context) {
            throw new NativeError("Context not found!").addContext({ contextId: id });
          }

          set((state) => {
            state.contexts.delete(id);
          });
        },

        getContext(id) {
          const { contexts } = get();
          return contexts.get(id);
        },

        getSingleViewContext() {
          const { contexts } = get();
          const context = contexts.get(_SINGLE_MODE_WORKSPACE_CONTEXT_ID);

          if (contexts.size !== 1 || !context) {
            throw new NativeError("Context does not exist in single mode");
          }

          return context;
        },
      };
    })
  );
}

export const apiClientFeatureContextProviderStore = createApiClientFeatureContextProviderStore();

export function useApiClientFeatureContextProvider<T>(selector: (state: ApiClientFeatureContextProviderState) => T) {
  return useStore(apiClientFeatureContextProviderStore, useShallow(selector));
}
