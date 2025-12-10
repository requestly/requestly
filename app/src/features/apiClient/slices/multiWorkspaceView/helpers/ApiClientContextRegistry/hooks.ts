import { useMemo } from "react";
import { NativeError } from "errors/NativeError";
import { ApiClientContext, ContextId } from "./types";
import { apiClientContextRegistry } from "./ApiClientContextRegistry";

export function useApiClientFeatureContext(contextId: ContextId): ApiClientContext {
  const context = useMemo(() => apiClientContextRegistry.getContext(contextId), [contextId]);

  if (!context) {
    throw new NativeError("No context found!");
  }

  return context;
}

export function useApiClientRepository(contextId: ContextId) {
  const context = useApiClientFeatureContext(contextId);
  return context.repositories;
}

export function useApiClientStore(contextId: ContextId) {
  const context = useApiClientFeatureContext(contextId);
  return context.store;
}
