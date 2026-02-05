export interface Workspace {
  id: string | null | undefined; // null for personal workspace
  name: string;
  accessCount?: number;
  adminCount?: any;
  owner?: string;
  archived?: boolean;
  subscriptionStatus?: any;
  members?: {
    [uid: string]: {
      role: WorkspaceMemberRole;
    };
  };
  membersCount?: number; // Old Field
  appsumo?: boolean;
  inviteId?: string;
  deleted?: boolean;
  createdAt?: number;

  isSyncEnabled?: boolean;
  workspaceType?: WorkspaceType;

  rootPath?: string;

  browserstackDetails?: {
    groupId: string;
    subGroupId: string | null;
  };
}

export enum WorkspaceType {
  PERSONAL = "PERSONAL",
  SHARED = "SHARED",
  LOCAL = "LOCAL",
  LOCAL_STORAGE = "LOCAL_STORAGE",
}

export enum WorkspaceMemberRole {
  admin = "admin",
  write = "write",
  read = "read",
}

export const PrivateWorkspaceStub: Workspace = {
  id: null,
  name: "private", // to find
  workspaceType: WorkspaceType.PERSONAL,
};
