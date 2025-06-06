import { RuleMetadataSyncEntity } from "@requestly/shared/types/syncEntities/rules";
import { SyncModel } from ".";
import { SyncEntityType } from "@requestly/shared/types/syncEntities";

export class RuleMetadataSyncModel extends SyncModel<RuleMetadataSyncEntity> {
  static entityType: SyncEntityType = SyncEntityType.RULE_METADATA;
}
