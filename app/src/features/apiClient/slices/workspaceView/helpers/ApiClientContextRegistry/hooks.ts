import { useMemo, useContext } from "react";
import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "./types";
import { apiClientContextRegistry } from "./ApiClientContextRegistry";
import { useWorkspaceId, WorkspaceStoreContext } from "features/apiClient/common/WorkspaceProvider";
import { ApiClientStore } from "./types";
import { NoopContextId } from "features/apiClient/commands/utils";

export function getApiClientFeatureContext(
  workspaceId?: ApiClientFeatureContext["workspaceId"]
): ApiClientFeatureContext {
  const isNoopContext = workspaceId === NoopContextId;
  if (isNoopContext) {
    throw new NativeError("Noop context cannot be queried from here").addContext({ workspaceId });
  }

  let context = ((workspaceId) => {
    if (workspaceId === undefined) {
      return apiClientContextRegistry.getLastUsedContext();
    }

    return apiClientContextRegistry.getContext(workspaceId);
  })(workspaceId);

  if (!context) {
    throw new NativeError("No context found in registry!").addContext({ workspaceId });
  }

  return context;
}

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

export function useApiClientFeatureContext(): ApiClientFeatureContext {
  const workspaceId = useWorkspaceId();
  const contextValue = useContext(WorkspaceStoreContext);
  if (workspaceId === NoopContextId && contextValue) {
    return { store: contextValue.store, workspaceId: NoopContextId, repositories: createInfiniteChainable() };
  }
  const context = useMemo(() => getApiClientFeatureContext(workspaceId), [workspaceId]);
  return context;
}

export function useApiClientRepository() {
  return useApiClientFeatureContext().repositories;
}

export function useApiClientStore(): ApiClientStore {
  return useApiClientFeatureContext().store;
}
