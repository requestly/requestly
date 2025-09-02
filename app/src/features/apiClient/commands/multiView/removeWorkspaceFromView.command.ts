import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { apiClientMultiWorkspaceViewStore } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

export const removeWorkspaceFromView = (workspaceId: string) => {
  const contextId = workspaceId; // assuming workspaceId is the same as contextId

  getTabServiceActions().closeTabsByContext(contextId);
  apiClientMultiWorkspaceViewStore.getState().removeWorkspace(contextId);
  apiClientFeatureContextProviderStore.getState().removeContext(contextId);
};
