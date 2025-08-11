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
  const { id } = await addWorkspaceToAppCtx(param);

  const renderableParam = {
    id,
    name: param.name,
    type: param.type,
  };
  apiClientMultiWorkspaceViewStore.getState().addWorkspace(renderableParam);
};
