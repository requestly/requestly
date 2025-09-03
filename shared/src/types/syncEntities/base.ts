import { SyncEntityType } from ".";

export interface BaseSyncEntity<T> {
  id: string;
  workspaceId: string;

  type: SyncEntityType;
  _deleted?: boolean;

  data: T;

  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  updatedBy?: string;
}
