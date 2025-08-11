import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { WorkspaceType } from "types";
import { addWorkspaceToView } from "./addWorkspaceToView.command";

export const resetToSingleView = (
  workspaceInSingleView: { id: string; type: WorkspaceType; name: string },
  userId?: string
) => {
  const { id, type, name } = workspaceInSingleView;

  const contexts = apiClientFeatureContextProviderStore.getState().contexts;

  contexts.forEach((context) => {
    apiClientFeatureContextProviderStore.getState().removeContext(context.id);
  });

  const selectedWorkspaces = apiClientMultiWorkspaceViewStore.getState().selectedWorkspaces;
  selectedWorkspaces.forEach((workspace) => {
    apiClientMultiWorkspaceViewStore.getState().removeWorkspace(workspace.getState().id);
  });
  apiClientMultiWorkspaceViewStore.getState().setViewMode(ApiClientViewMode.SINGLE);

  if (type === WorkspaceType.LOCAL) {
    addWorkspaceToView({
      id,
      name,
      type,
      userId,
    });
  }
};
