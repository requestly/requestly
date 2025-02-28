import { StorageRecord } from "~/types/entities/rules";
import { BaseSyncEntity } from "../base";
import { SyncEntityType } from "..";

export interface RuleDataSyncEntity
  extends BaseSyncEntity<
    Omit<StorageRecord, "status" | "isFavourite" | "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">
  > {
  type: SyncEntityType.RULE_DATA;
}
