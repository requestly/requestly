export interface Workspace {
  id: string;
  name: string;
  owner?: string;
  archived?: boolean;
  subscriptionStatus?: any;
  accessCount?: number;
  adminCount?: any;
  members?: {
    [uid: string]: {
      role: "write" | "admin";
    };
  };
  membersCount?: number; // Old Field
  appsumo?: boolean;
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
