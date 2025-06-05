// import Logger from "lib/logger";
import { Workspace, WorkspaceType } from "../types";

export const isLocalFSWorkspace = (workspace: Workspace) => {
  return workspace?.workspaceType === WorkspaceType.LOCAL;
};

export const isPersonalWorkspace = (workspace: Workspace) => {
  return workspace?.workspaceType === WorkspaceType.PERSONAL;
};

export const isSharedWorkspace = (workspace: Workspace) => {
  return workspace?.workspaceType === WorkspaceType.SHARED;
};

export const getActiveWorkspaceId = (workspaceIds: string[]) => {
  return workspaceIds?.[0];
};
