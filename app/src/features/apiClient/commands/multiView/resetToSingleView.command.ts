import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

export const resetToSingleView = () => {
  console.log("DG-8.2: resetToSingleView called - clearing all contexts");
  apiClientMultiWorkspaceViewStore.getState().setIsLoaded(false);
  apiClientFeatureContextProviderStore.getState().clearAll();

  const selectedWorkspaces = apiClientMultiWorkspaceViewStore.getState().selectedWorkspaces;
  selectedWorkspaces.forEach((workspace) => {
    apiClientMultiWorkspaceViewStore.getState().removeWorkspace(workspace.getState().id);
  });
  apiClientMultiWorkspaceViewStore.getState().setViewMode(ApiClientViewMode.SINGLE);
};
