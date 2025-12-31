import { useMemo } from "react";
import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "./types";
import { apiClientContextRegistry } from "./ApiClientContextRegistry";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";

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

function useApiClientFeatureContext(): ApiClientFeatureContext {
  const workspaceId = useWorkspaceId();
  const context = useMemo(() => getApiClientFeatureContext(workspaceId), [workspaceId]);
  return context;
}

export function useApiClientRepository() {
  return useApiClientFeatureContext().repositories;
}

export function useApiClientStore() {
  return useApiClientFeatureContext().store;
}
