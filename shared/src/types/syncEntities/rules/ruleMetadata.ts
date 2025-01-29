import { StorageRecord } from "~/types/entities/rules";
import { SyncEntity } from "../base";

export interface RuleMetadataSyncEntity extends SyncEntity {
  status: StorageRecord["status"];
  isFavourite: StorageRecord["isFavourite"];
}
