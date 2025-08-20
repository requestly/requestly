import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
} from "../store/multiWorkspaceView/multiWorkspaceView.store";
import { useContextId } from "./contextId.context";
import {
  ApiClientFeatureContext,
  apiClientFeatureContextProviderStore,
  NoopContext,
  NoopContextId,
  // useApiClientFeatureContextProvider,
} from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { useMemo } from "react";

export function getApiClientFeatureContext(contextId: string) {
  const { getSingleViewContext, getContext, getLastUsedContext } = apiClientFeatureContextProviderStore.getState();
  if (contextId === NoopContextId) {
    return NoopContext;
  }
  const { viewMode } = apiClientMultiWorkspaceViewStore.getState();
  if (viewMode === ApiClientViewMode.SINGLE) {
    return getSingleViewContext();
  }
  if (!contextId) {
    return getLastUsedContext();
  }
  return getContext(contextId);
}

export function useApiClientFeatureContext(): ApiClientFeatureContext {
  const contextId = useContextId();
  const context = useMemo(() => {
    return getApiClientFeatureContext(contextId);
  }, [contextId]);

  if (!context) {
    throw new Error("No context found!");
  }

  return context;
}

export function useApiClientRepository() {
  const context = useApiClientFeatureContext();
  return context.repositories;
}
