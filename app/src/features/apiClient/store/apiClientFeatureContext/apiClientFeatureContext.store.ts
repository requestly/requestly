import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { AllApiClientStores } from "../apiRecords/ApiRecordsContextProvider";
import { RenderableWorkspaceState } from "../multiWorkspaceView/multiWorkspaceView.store";
import { create, useStore } from "zustand";
import { NativeError } from "errors/NativeError";
import { useShallow } from "zustand/shallow";

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
  clearAll(): void;
};

function createApiClientFeatureContextProviderStore() {
  return create<ApiClientFeatureContextProviderState>()((set, get) => {
    return {
      contexts: new Map(),

      addContext(context) {
        const { contexts } = get();
        contexts.set(context.id, context);
        set({ contexts });
      },

      removeContext(id) {
        const { contexts } = get();
        const context = contexts.get(id);

        if (!context) {
          throw new NativeError("Context not found!").addContext({ contextId: id });
        }

        contexts.delete(id);
        set({ contexts });
      },

      getContext(id) {
        const { contexts } = get();
        return contexts.get(id);
      },

      getSingleViewContext() {
        const { contexts } = get();

        if (contexts.size !== 1) {
          throw new NativeError("Context does not exist in single mode");
        }

        return contexts.values().next().value as ApiClientFeatureContext;
      },

      clearAll() {
        set({ contexts: new Map() });
      },
    };
  });
}

export const apiClientFeatureContextProviderStore = createApiClientFeatureContextProviderStore();

export function useApiClientFeatureContextProvider<T>(selector: (state: ApiClientFeatureContextProviderState) => T) {
  return useStore(apiClientFeatureContextProviderStore, useShallow(selector));
}
