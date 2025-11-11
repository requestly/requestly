import { useContextId } from "./contextId.context";
import * as apiClientFeatureContextStore from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { useMemo } from "react";
import { getApiClientFeatureContext } from "../commands/store.utils";

export function useApiClientFeatureContext(): apiClientFeatureContextStore.ApiClientFeatureContext {
  //find the workspaceId using contextId
  const contextId = useContextId();
  console.log("contextId inside hook", contextId);

  const context = useMemo(() => {
    return getApiClientFeatureContext(contextId);
  }, [contextId]);
  console.log("context inside hook", context);
  if (!context) {
    throw new Error("No context found!");
  }

  return context;
}

export function useApiClientRepository() {
  const context = useApiClientFeatureContext();
  return context.repositories;
}
