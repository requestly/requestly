import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { WorkspaceType } from "types";
import { setupContext } from "../context";

export const resetToSingleView = (
  workspaceInSingleView: { id: string; type: WorkspaceType; name: string },
  userId?: string
) => {
  const { id, type } = workspaceInSingleView;

  apiClientFeatureContextProviderStore.getState().clearAll();

  const selectedWorkspaces = apiClientMultiWorkspaceViewStore.getState().selectedWorkspaces;
  selectedWorkspaces.forEach((workspace) => {
    apiClientMultiWorkspaceViewStore.getState().removeWorkspace(workspace.getState().id);
  });
  apiClientMultiWorkspaceViewStore.getState().setViewMode(ApiClientViewMode.SINGLE);

  return setupContext({
    workspaceId: id,
    workspaceType: type,
    user: {
      loggedIn: !!userId,
      uid: userId ?? "",
    },
  });
};
