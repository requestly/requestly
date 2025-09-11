import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { AllApiClientStores } from "../apiRecords/ApiRecordsContextProvider";
import { RenderableWorkspaceState } from "../multiWorkspaceView/multiWorkspaceView.store";
import { create, useStore } from "zustand";
import { NativeError } from "errors/NativeError";
import { useShallow } from "zustand/shallow";
import { createApiRecordsStore } from "../apiRecords/apiRecords.store";
import { createEnvironmentsStore } from "../environments/environments.store";
import { createErroredRecordsStore } from "../erroredRecords/erroredRecords.store";

function createInfiniteChainable<T>() {
  const handler = {
    get: () => {
      return new Proxy(() => {}, handler);
    },
    apply: () => {
      return new Proxy(() => {}, handler);
    },
  };

  return new Proxy({}, handler) as T;
}

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
  console.log("DG-8.3: createApiClientFeatureContextProviderStore called", Date.now());
  return create<ApiClientFeatureContextProviderState>()((set, get) => {
    return {
      contexts: new Map(),

      addContext(context) {
        const randomID = Math.random().toString(36).substring(2, 15);
        const { contexts, setLastUsedContext } = get();
        console.log(
          "DG-8.0: addContext called for contextID",
          JSON.stringify({ id: context.id, data: Array.from(contexts.keys()) }, null, 2),
          randomID,
          Date.now()
        );
        if (contexts.has(context.id)) {
          console.log("DG-8.1: early return for contexID", context.id, randomID, Date.now());
          return;
        }
        contexts.set(context.id, context);
        set({ contexts });
        setLastUsedContext(context);
        console.log(
          "DG-8.2: addContext completed for contextID",
          JSON.stringify({ id: context.id, data: Array.from(contexts.keys()) }, null, 2),
          randomID,
          Date.now()
        );
      },

      removeContext(id) {
        const { contexts, lastUsedContext, setLastUsedContext } = get();
        const context = contexts.get(id);

        if (!context) {
          return;
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
        const { contexts } = get();
        const context = contexts.get(id);
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

export const NoopContextId = "__stub_context_id";
export const NoopContext: ApiClientFeatureContext = {
  id: NoopContextId,
  workspaceId: NoopContextId,
  stores: {
    records: createApiRecordsStore({ records: [], erroredRecords: [] }),
    environments: createEnvironmentsStore({
      environments: {},
      globalEnvironment: {
        id: "na",
        name: "na",
        variables: {},
      },
      contextId: NoopContextId,
    }),
    erroredRecords: createErroredRecordsStore({ apiErroredRecords: [], environmentErroredRecords: [] }),
  },
  repositories: createInfiniteChainable(),
};

export function setLastUsedContextId(id: string) {
  const context = apiClientFeatureContextProviderStore.getState().contexts.get(id);
  if (!context) {
    throw new Error("Could not find context!");
  }
  apiClientFeatureContextProviderStore.getState().setLastUsedContext(context);
}
