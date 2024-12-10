// import Logger from "lib/logger";
import { Workspace } from "../types";

export const LOGGED_OUT_WORKSPACE_ID = "local";
export const LoggedOutWorkspace: Workspace = {
  id: LOGGED_OUT_WORKSPACE_ID,
  name: "Private (Local)",
  members: {},
};

export const isLocalWorkspace = (workspaceId: string) => {
  return workspaceId === LOGGED_OUT_WORKSPACE_ID;
};

const PERSONAL_WORKSPACE_PREFIX = "personal-";
export const isPersonalWorkspace = (workspaceId: string) => {
  return !!workspaceId?.startsWith(PERSONAL_WORKSPACE_PREFIX);
};

export const getPersonalWorkspaceId = (userId?: string) => {
  return `${PERSONAL_WORKSPACE_PREFIX}${userId}`;
};

export const getPrivateWorkspace = (userId: string): Workspace => {
  return {
    id: getPersonalWorkspaceId(userId),
    name: "Private Workspace (Default)",
    members: {
      [userId]: {
        role: "admin",
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

export const isSharedWorkspace = (workspaceId: string) => {
  if (workspaceId === LOGGED_OUT_WORKSPACE_ID || isPersonalWorkspace(workspaceId)) {
    return false;
  }

  return true;
};

// For now only as we can have only 1 connected workspace right now
export const getActiveWorkspaceId = (activeWorkspaceIds: string[]) => {
  return activeWorkspaceIds?.[0];
};
