import { ApiClientViewMode, useApiClientMultiWorkspaceView } from "../store/multiWorkspaceView/multiWorkspaceView.store";
import { useContextId } from "./contextId.context";
import { ApiClientFeatureContext, useApiClientFeatureContextProvider } from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { useMemo } from "react";


export function useApiClientFeatureContext(): ApiClientFeatureContext {
  const viewMode = useApiClientMultiWorkspaceView(s => s.viewMode);
  const [getSingleViewContext, getContext] = useApiClientFeatureContextProvider(s => [s.getSingleViewContext, s.getContext]);
  const contextId = useContextId();

  const context = (() => {
    if(viewMode === ApiClientViewMode.SINGLE) {
      return getSingleViewContext();
    }
    if(!contextId) {
      throw new Error("Mode is multi but no contextId found!");
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
