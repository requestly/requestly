import { ApiClientViewMode, useApiClientMultiWorkspaceView } from "../store/multiWorkspaceView/multiWorkspaceView.store";
import { useContextId } from "./contextId.context";
import { ApiClientFeatureContext, useApiClientFeatureContextProvider } from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { useMemo } from "react";


export function useApiClientFeatureContext(): ApiClientFeatureContext {
  const viewMode = useApiClientMultiWorkspaceView(s => s.viewMode);
  const [getSingleViewContext, getContext, getLastUsedContext] = useApiClientFeatureContextProvider(s => [s.getSingleViewContext, s.getContext, s.getLastUsedContext]);
  const contextId = useContextId();

  const context = (() => {
    if(viewMode === ApiClientViewMode.SINGLE) {
      return getSingleViewContext();
    }
    if(!contextId) {
      return getLastUsedContext();
    }
    return getContext(contextId);
  })();

  if(!context) {
    throw new Error("No context found!");
  }


  return useMemo(() => {
    return context;
  }, [context]);
}
