export interface Workspace {
  id: string;
  name: string;
  accessCount?: number;
  adminCount?: any;
  owner?: string;
  archived?: boolean;
  subscriptionStatus?: any;
  members?: {
    [uid: string]: {
      role: "write" | "admin";
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
}

export enum WorkspaceType {
  PERSONAL = "PERSONAL",
  SHARED = "SHARED",
  LOCAL = "LOCAL",
  LOCAL_STORAGE = "LOCAL_STORAGE",
}
