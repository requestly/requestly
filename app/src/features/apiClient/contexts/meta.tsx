import { useContextId } from "./contextId.context";
import * as apiClientFeatureContextStore from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { useMemo } from "react";
import { getApiClientFeatureContext } from "../commands/store.utils";

export function useApiClientFeatureContext(): apiClientFeatureContextStore.ApiClientFeatureContext {
  const contextId = useContextId();
  const context = useMemo(() => {
    const ctx = getApiClientFeatureContext(contextId);
    if (ctx && ctx.stores?.records) {
      const storeId = ctx.stores.records.getState().storeId;
      console.log("DG-5.1: useApiClientFeatureContext", JSON.stringify({contextId, storeId}, null, 2));
    }
    return ctx;
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
