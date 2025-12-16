import { useMemo } from "react";
import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "./types";
import { apiClientContextRegistry } from "./ApiClientContextRegistry";

function useApiClientFeatureContext(workspaceId: ApiClientFeatureContext["workspaceId"]): ApiClientFeatureContext {
  const context = useMemo(() => apiClientContextRegistry.getContext(workspaceId), [workspaceId]);

  if (!context) {
    throw new NativeError("No context found!");
  }

  return context;
}

function useApiClientRepository(workspaceId: ApiClientFeatureContext["workspaceId"]) {
  const context = useApiClientFeatureContext(workspaceId);
  return context.repositories;
}

function useApiClientStore(workspaceId: ApiClientFeatureContext["workspaceId"]) {
  const context = useApiClientFeatureContext(workspaceId);
  return context.store;
}
