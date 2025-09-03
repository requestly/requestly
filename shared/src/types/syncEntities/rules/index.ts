import { RuleMetadataSyncEntity } from "./ruleMetadata";
import { RuleDataSyncEntity } from "./ruleData";

export type SyncEntity = RuleMetadataSyncEntity | RuleDataSyncEntity;
export { RuleDataSyncEntity, RuleMetadataSyncEntity };
