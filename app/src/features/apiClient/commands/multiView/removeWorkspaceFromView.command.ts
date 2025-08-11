import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

export const removeWorkspaceFromView = (workspaceId: string) => {
  const contextId = workspaceId; // assuming workspaceId is the same as contextId
  const currentViewMode = apiClientMultiWorkspaceViewStore.getState().viewMode;
  const selectedWorkspaces = apiClientMultiWorkspaceViewStore.getState().selectedWorkspaces;
  if (
    currentViewMode === ApiClientViewMode.MULTI &&
    selectedWorkspaces.length === 1 &&
    selectedWorkspaces[0].getState().id === workspaceId
  ) {
    throw new Error(
      "Cannot remove the last workspace from view. Please add another workspace first, or switch to single view."
    );
  }
  apiClientMultiWorkspaceViewStore.getState().removeWorkspace(contextId);
  apiClientFeatureContextProviderStore.getState().removeContext(contextId);
};
