// import Logger from "lib/logger";
import { Workspace } from "../types";

export const LOGGED_OUT_WORKSPACE_ID = "local";
export const LoggedOutWorkspace: Workspace = {
  id: LOGGED_OUT_WORKSPACE_ID,
  name: "Private (Local)",
};

const PRIVATE_WORKSPACE_SUFFIX = "private-";
export const isPrivateWorkspace = (workspaceId: string) => {
  return !!workspaceId?.startsWith(PRIVATE_WORKSPACE_SUFFIX);
};

export const getPrivateWorkspaceId = (userId?: string) => {
  return `${PRIVATE_WORKSPACE_SUFFIX}${userId}`;
};

export const getPrivateWorkspace = (userId: string): Workspace => {
  return {
    id: getPrivateWorkspaceId(userId),
    name: "Private Workspace (Default)",
    createdAt: 0,
  };
};

export const hasAccessToWorkspace = (userId?: string, workspace?: Workspace): boolean => {
  if (!workspace) {
    return false;
  }

  if (workspace.id === LOGGED_OUT_WORKSPACE_ID) {
    return true;
  } else if (workspace.id === getPrivateWorkspaceId(userId)) {
    return true;
  } else {
    const hasAccess = !!workspace.members?.[userId];
    return hasAccess;
  }
};

export const isSharedWorkspace = (workspaceId: string) => {
  if (workspaceId === LOGGED_OUT_WORKSPACE_ID || isPrivateWorkspace(workspaceId)) {
    return false;
  }

  return true;
};
