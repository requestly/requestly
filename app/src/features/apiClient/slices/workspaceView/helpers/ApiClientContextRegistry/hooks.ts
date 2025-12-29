import { useMemo } from "react";
import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "./types";
import { apiClientContextRegistry } from "./ApiClientContextRegistry";

export function getApiClientFeatureContext(
  workspaceId?: ApiClientFeatureContext["workspaceId"]
): ApiClientFeatureContext {
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

function useApiClientFeatureContext(workspaceId?: ApiClientFeatureContext["workspaceId"]): ApiClientFeatureContext {
  const context = useMemo(() => getApiClientFeatureContext(workspaceId), [workspaceId]);
  return context;
}

export function useApiClientRepository(workspaceId?: ApiClientFeatureContext["workspaceId"]) {
  const context = useApiClientFeatureContext(workspaceId);
  return context.repositories;
}

export function useApiClientStore(workspaceId: ApiClientFeatureContext["workspaceId"]) {
  const context = useApiClientFeatureContext(workspaceId);
  return context.store;
}
