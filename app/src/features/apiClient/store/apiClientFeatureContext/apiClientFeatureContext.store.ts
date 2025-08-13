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
  lastUsedContext?: ApiClientFeatureContext;
  contexts: Map<RenderableWorkspaceState["id"], ApiClientFeatureContext>;

  addContext(context: ApiClientFeatureContext): void;
  removeContext(id: RenderableWorkspaceState["id"]): void;
  getContext(id: RenderableWorkspaceState["id"]): ApiClientFeatureContext | undefined;
  getSingleViewContext(): ApiClientFeatureContext;
  getLastUsedContext(): ApiClientFeatureContext | undefined;
  clearAll(): void;
  setLastUsedContext: (context?: ApiClientFeatureContext) => void;
};

function createApiClientFeatureContextProviderStore() {
  return create<ApiClientFeatureContextProviderState>()((set, get) => {
    return {
      contexts: new Map(),

      addContext(context) {
        const { contexts, setLastUsedContext } = get();
        contexts.set(context.id, context);
        set({ contexts });
        setLastUsedContext(context);
      },

      removeContext(id) {
        const { contexts, lastUsedContext, setLastUsedContext } = get();
        const context = contexts.get(id);

        if (!context) {
          throw new NativeError("Context not found!").addContext({ contextId: id });
        }

        contexts.delete(id);

        if (lastUsedContext?.id === id) {
          setLastUsedContext(undefined);
        }

        set({ contexts });
      },

      setLastUsedContext(context) {
        set({
          lastUsedContext: context,
        });
      },

      getContext(id) {
        const { contexts, setLastUsedContext } = get();
        const context = contexts.get(id);
        if (context) {
          setLastUsedContext(context);
        }
        return context;
      },

      getSingleViewContext() {
        const { contexts } = get();

        if (contexts.size !== 1) {
          throw new NativeError("Context does not exist in single mode");
        }

        return contexts.values().next().value as ApiClientFeatureContext;
      },

      getLastUsedContext() {
        const { contexts, lastUsedContext, setLastUsedContext } = get();
        if (lastUsedContext) {
          return lastUsedContext;
        }
        if (contexts.size) {
          const topContext = contexts.values().next().value; // debatable
          setLastUsedContext(topContext);
          return topContext;
        }
      },

      clearAll() {
        set({ contexts: new Map(), lastUsedContext: undefined });
      },
    };
  });
}

export const apiClientFeatureContextProviderStore = createApiClientFeatureContextProviderStore();

export function useApiClientFeatureContextProvider<T>(selector: (state: ApiClientFeatureContextProviderState) => T) {
  return useStore(apiClientFeatureContextProviderStore, useShallow(selector));
}
