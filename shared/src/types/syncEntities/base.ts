export interface SyncEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  _deleted?: boolean;
  createdBy: string;
  updatedBy: string;
}
