import { WorkspaceType } from "types";
import { setupContext } from "../context/setupContext.command";
import { NativeError } from "errors/NativeError";
import { apiClientMultiWorkspaceViewStore } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

type Workspace = {
  id: string;
  name: string;
  userId?: string; // if not present, then we assume that user is logged out
  type: WorkspaceType;
};

const addWorkspaceToAppCtx = async (param: Workspace) => {
  return setupContext({
    workspaceId: param.id,
    workspaceType: param.type,
    user: {
      loggedIn: !!param.userId,
      uid: param.userId ?? "",
    },
  });
};

export const addWorkspaceToView = async (param: Workspace) => {
  if (param.type !== WorkspaceType.LOCAL)
    throw new NativeError("[ADD TO VIEW] Multi view only avaiable for local workspaces");
  const contextId = param.id; // assumes contextId is the same as workspace id

  const renderableParam = {
    id: contextId,
    name: param.name,
    type: param.type,
  };
  apiClientMultiWorkspaceViewStore.getState().addWorkspace(renderableParam);
  apiClientMultiWorkspaceViewStore
    .getState()
    .setStateForSelectedWorkspace(contextId, { loading: true, errored: false });
  try {
    await addWorkspaceToAppCtx(param);
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
  }
};
