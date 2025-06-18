import { StorageEntity } from "../base";

export enum RecordType {
  RULE = "rule",
  GROUP = "group",
}

export enum RecordStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export interface BaseItem extends StorageEntity {
  name: string;
  description?: string;
  objectType: RecordType;

  status: RecordStatus;
  isFavourite?: boolean;

  isSample?: boolean;
  isReadOnly?: boolean;

  /** Deprecated in SyncingV2 **/
  createdBy?: string;
  creationDate?: number;
  currentOwner?: string;
  lastModifiedBy?: string;
  modificationDate?: number;
}
