import { StorageRecord } from "~/types/entities/rules";
import { BaseSyncEntity } from "../base";
import { SyncEntityType } from "..";
export interface RuleMetadataSyncEntity
  extends BaseSyncEntity<{
    status: StorageRecord["status"];
    isFavourite: StorageRecord["isFavourite"];
  }> {
  type: SyncEntityType.RULE_METADATA;
}
