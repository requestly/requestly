import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { setupContext } from "../context";
import { Workspace } from "features/workspaces/types";

export const resetToSingleView = (workspaceInSingleView: Workspace, userId?: string) => {
  apiClientFeatureContextProviderStore.getState().clearAll();

  const selectedWorkspaces = apiClientMultiWorkspaceViewStore.getState().selectedWorkspaces;
  selectedWorkspaces.forEach((workspace) => {
    apiClientMultiWorkspaceViewStore.getState().removeWorkspace(workspace.getState().id);
  });
  apiClientMultiWorkspaceViewStore.getState().setViewMode(ApiClientViewMode.SINGLE);

  return setupContext(workspaceInSingleView, {
    loggedIn: !!userId,
    uid: userId ?? "",
  });
};
