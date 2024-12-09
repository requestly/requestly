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
  appsumo?: boolean;
  deleted?: boolean;
  createdAt?: number;
}
