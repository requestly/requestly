import { RuleDataSyncEntity } from "./rules/ruleData";
import { RuleMetadataSyncEntity } from "./rules/ruleMetadata";

export enum SyncEntityType {
  RULE_DATA = "rule_data",
  RULE_METADATA = "rule_metadata",
}

export interface syncTypeToEntityMap {
  [SyncEntityType.RULE_DATA]: RuleDataSyncEntity;
  [SyncEntityType.RULE_METADATA]: RuleMetadataSyncEntity;
}

export * from "./base";
export * from "./rules";
