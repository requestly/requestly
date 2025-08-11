import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { AllApiClientStores } from "../apiRecords/ApiRecordsContextProvider";
import { RenderableWorkspaceState } from "../multiWorkspaceView/multiWorkspaceView.store";
import { create, useStore } from "zustand";
import { NativeError } from "errors/NativeError";
import { useShallow } from "zustand/shallow";

type ApiClientFeatureContext = {
  id: RenderableWorkspaceState["id"]; // Instead of id we should this be workspaceId or as a new property ?
  stores: AllApiClientStores;
  repositories: ApiClientRepositoryInterface;
};

type ApiClientFeatureContextProviderState = {
  version: number;
  contexts: Map<RenderableWorkspaceState["id"], ApiClientFeatureContext>;

  _incrementVersion(): void;
  addContext(context: ApiClientFeatureContext): void;
  removeContext(id: RenderableWorkspaceState["id"]): void;
  getContext(id: RenderableWorkspaceState["id"]): ApiClientFeatureContext | undefined;
  getSingleViewContext(): ApiClientFeatureContext;
  refreshContext(id: RenderableWorkspaceState["id"], context: ApiClientFeatureContext): void;
};

function createApiClientFeatureContextProviderStore() {
  return create<ApiClientFeatureContextProviderState>()((set, get) => {
    return {
      version: 0,
      contexts: new Map<RenderableWorkspaceState["id"], ApiClientFeatureContext>(),

      addContext(context) {
        const { contexts, _incrementVersion } = get();
        contexts.set(context.id, context);
        set({ contexts });
        _incrementVersion();
      },

      removeContext(id) {
        const { contexts, _incrementVersion } = get();
        const context = contexts.get(id);

        if (!context) {
          throw new NativeError("Context not found!").addContext({ contextId: id });
        }

        contexts.delete(id);
        set({ contexts });
        _incrementVersion();
      },

      getContext(id) {
        const { contexts } = get();
        return contexts.get(id);
      },

      getSingleViewContext() {
        const { contexts } = get();
        const context = Object.values(Object.fromEntries(contexts))[0];

        if (!context) {
          throw new NativeError("Context does not exist in single mode");
        }

        return Object.values(Object.fromEntries(contexts))[0];
      },

      refreshContext(id, context) {
        const { contexts, _incrementVersion } = get();
        contexts.set(id, context);
        set({ contexts });
        _incrementVersion();
      },

      _incrementVersion() {
        set({ version: get().version + 1 });
      },
    };
  });
}

export const apiClientFeatureContextProviderStore = createApiClientFeatureContextProviderStore();

export function useApiClientFeatureContextProviderStore<T>(
  selector: (state: ApiClientFeatureContextProviderState) => T
) {
  return useStore(apiClientFeatureContextProviderStore, useShallow(selector));
}
