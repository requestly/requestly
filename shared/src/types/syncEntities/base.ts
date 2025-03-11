import { SyncEntityType } from ".";

export interface BaseSyncEntity<T> {
  id: string;
  forkId?: string;
  isGlobal?: boolean;
  workspaceId: string;

  type: SyncEntityType;
  _deleted?: boolean;

  data: T;

  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
}
