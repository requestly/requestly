import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { setupContext } from "../context/setupContext.command";
import { NativeError } from "errors/NativeError";
import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { captureException } from "@sentry/react";

export const addWorkspaceToView = async (workspace: Workspace, userId?: string) => {
  if (workspace.workspaceType !== WorkspaceType.LOCAL) {
    throw new NativeError("[ADD TO VIEW] Multi view only avaiable for local workspaces");
  }

  const viewMode = apiClientMultiWorkspaceViewStore.getState().viewMode;

  if (viewMode !== ApiClientViewMode.MULTI) {
    getTabServiceActions().resetTabs(true);
    apiClientMultiWorkspaceViewStore.getState().setViewMode(ApiClientViewMode.MULTI);
  }

  const contextId = workspace.id; // assumes contextId is the same as workspace id
  const existingContext = apiClientMultiWorkspaceViewStore.getState().getSelectedWorkspace(contextId);
  if (existingContext) {
    return;
  }

  const renderableParam = {
    id: contextId,
    name: workspace.name,
    type: workspace.workspaceType,
    rawWorkspace: workspace,
  };
  apiClientMultiWorkspaceViewStore.getState().addWorkspace(renderableParam);
  apiClientMultiWorkspaceViewStore
    .getState()
    .setStateForSelectedWorkspace(contextId, { loading: true, errored: false });
  try {
    await setupContext(workspace, {
      loggedIn: !!userId,
      uid: userId ?? "",
    });
    apiClientMultiWorkspaceViewStore
      .getState()
      .setStateForSelectedWorkspace(contextId, { loading: false, errored: false });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred while adding workspace to view";
    apiClientMultiWorkspaceViewStore.getState().setStateForSelectedWorkspace(contextId, {
      loading: false,
      errored: true,
      error: errorMessage,
    });
    captureException(error);
  }
};
