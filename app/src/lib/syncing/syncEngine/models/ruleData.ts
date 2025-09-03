import { RuleDataSyncEntity } from "@requestly/shared/types/syncEntities/rules";
import { SyncEntityType } from "@requestly/shared/types/syncEntities";
import { SyncModel } from ".";

export class RuleDataSyncModel extends SyncModel<RuleDataSyncEntity> {
  static entityType: SyncEntityType = SyncEntityType.RULE_DATA;
}
