import { Workspace, WorkspaceType } from "features/workspaces/types";
import { WorkspaceInfo } from "./types";

export function getWorkspaceInfo(workspace: Workspace): WorkspaceInfo {
  if (workspace.workspaceType === WorkspaceType.LOCAL) {
    return {
      id: workspace.id,
      meta: {
        type: WorkspaceType.LOCAL,
        rootPath: workspace.rootPath,
      },
    };
  }

  return {
    id: workspace.id,
    meta: {
      type: workspace.workspaceType ?? WorkspaceType.PERSONAL,
    },
  };
}
