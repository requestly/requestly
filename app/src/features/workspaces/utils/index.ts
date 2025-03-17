// import Logger from "lib/logger";
import { Workspace, WorkspaceMemberRole, WorkspaceType } from "../types";

export const LOGGED_OUT_WORKSPACE_ID = "localstorage";
export const LoggedOutWorkspace: Workspace = {
  id: LOGGED_OUT_WORKSPACE_ID,
  name: "Private (LocalStorage)",
  members: {},
  workspaceType: WorkspaceType.LOCAL_STORAGE,
};

const PERSONAL_WORKSPACE_PREFIX = "personal-";
export const getPersonalWorkspaceId = (userId?: string) => {
  return `${PERSONAL_WORKSPACE_PREFIX}${userId}`;
};

export const getPrivateWorkspace = (userId: string): Workspace => {
  return {
    id: getPersonalWorkspaceId(userId),
    name: "Private Workspace (Default)",
    members: {
      [userId]: {
        role: WorkspaceMemberRole.admin,
      },
    },
    createdAt: 0,
  };
};

export const hasAccessToWorkspace = (userId?: string, workspace?: Workspace): boolean => {
  if (!workspace) {
    return false;
  }

  if (workspace.id === LOGGED_OUT_WORKSPACE_ID) {
    return true;
  } else {
    const hasAccess = !!workspace.members?.[userId];
    return hasAccess;
  }
};

export const isOnlineWorkspace = (workspaceId: string) => {
  if (workspaceId === LOGGED_OUT_WORKSPACE_ID) {
    return false;
  }

  return true;
};

export const isLocalStorageWorkspace = (workspaceId: string) => {
  return workspaceId === LOGGED_OUT_WORKSPACE_ID;
};

export const isLocalFSWorkspace = (workspace: Workspace) => {
  return workspace?.workspaceType === WorkspaceType.LOCAL;
};

export const isPersonalWorkspace = (workspace: Workspace) => {
  return workspace?.workspaceType === WorkspaceType.PERSONAL;
};

export const isSharedWorkspace = (workspace: Workspace) => {
  return workspace?.workspaceType === WorkspaceType.SHARED;
};

export const getLocalFSWorkspaceRootPath = (workspace: Workspace) => {
  return workspace?.rootPath;
};

export const getActiveWorkspaceId = (workspaceIds: string[]) => {
  return workspaceIds?.[0];
};
