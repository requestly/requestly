import { RuleDataSyncEntity, RuleMetadataSyncEntity } from "@requestly/shared/types/syncEntities/rules";
import { StorageModel } from ".";
import { RuleDataSyncModel } from "../syncEngine/models/ruleData";
import { RuleMetadataSyncModel } from "../syncEngine/models/ruleMetadata";
import { RecordStatus, StorageRecord } from "@requestly/shared/types/entities/rules";
import { SyncEntityType } from "@requestly/shared/types/syncEntities";

export class RuleStorageModel extends StorageModel<StorageRecord> {
  ruleDataSyncModel!: RuleDataSyncModel;
  ruleMetadataSyncModel!: RuleMetadataSyncModel;

  constructor(data: StorageRecord, workspaceId: string) {
    super(data, workspaceId);
    this.initSyncModels(data, workspaceId);
  }

  get data() {
    return RuleStorageModel.createStorageEntityFromSyncModels(this.ruleDataSyncModel, this.ruleMetadataSyncModel);
  }

  initSyncModels(data: StorageRecord, workspaceId: string): void {
    // TODO: Improve this logic and use spread and delete operator
    const ruleMetadataEntity: RuleMetadataSyncEntity = {
      id: data.id,
      workspaceId: workspaceId,
      type: SyncEntityType.RULE_METADATA,

      data: {
        status: data.status,
        isFavourite: data.isFavourite || false,
      },

      createdAt: data.createdAt || 0,
      updatedAt: data.updatedAt || 0,
      createdBy: data.createdBy || "",
      updatedBy: data.updatedBy || "",
    };
    this.ruleMetadataSyncModel = new RuleMetadataSyncModel(ruleMetadataEntity);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, isFavourite, id, createdAt, updatedAt, createdBy, updatedBy, ..._ruleDataEntity } = data;
    const ruleDataEntity: RuleDataSyncEntity = {
      id: data.id,
      workspaceId: workspaceId,
      type: SyncEntityType.RULE_DATA,

      data: { ..._ruleDataEntity },

      createdAt: data.createdAt || 0,
      updatedAt: data.updatedAt || 0,
      createdBy: data.createdBy || "",
      updatedBy: data.updatedBy || "",
    };
    this.ruleDataSyncModel = new RuleDataSyncModel(ruleDataEntity);
  }

  delete(): void {
    this.ruleDataSyncModel.delete();
    this.ruleMetadataSyncModel.delete();
    super.delete();
  }

  async save() {
    await this.ruleDataSyncModel.save();
    await this.ruleMetadataSyncModel.save();
    console.log("[RuleStorageModel.save] after saving", {
      ruleDataSyncModel: this.ruleDataSyncModel,
      ruleMetadataSyncModel: this.ruleMetadataSyncModel,
      data: this.data,
    });
    await super.save();
  }

  static async createFromSyncModels(
    ruleDataSyncModel?: RuleDataSyncModel,
    ruleMetadataSyncModel?: RuleMetadataSyncModel
  ) {
    if (ruleMetadataSyncModel && !ruleDataSyncModel) {
      ruleDataSyncModel = await RuleDataSyncModel.get(
        ruleMetadataSyncModel.entity.id,
        ruleMetadataSyncModel.entity.workspaceId
      );
    }

    if (ruleDataSyncModel && !ruleMetadataSyncModel) {
      ruleMetadataSyncModel = await RuleMetadataSyncModel.get(
        ruleDataSyncModel.entity.id,
        ruleDataSyncModel.entity.workspaceId
      );
      // Bypassing ruleMetadata for now due to RDB replication
      if (!ruleMetadataSyncModel) {
        ruleMetadataSyncModel = new RuleMetadataSyncModel({
          id: ruleDataSyncModel.entity.id,
          workspaceId: ruleDataSyncModel.entity.workspaceId,
          type: SyncEntityType.RULE_METADATA,
          data: {
            status: RecordStatus.INACTIVE,
            isFavourite: false,
          },

          createdAt: ruleDataSyncModel.entity.createdAt || 0,
          updatedAt: ruleDataSyncModel.entity.updatedAt || 0,
          createdBy: ruleDataSyncModel.entity.createdBy || "",
          updatedBy: ruleDataSyncModel.entity.updatedBy || "",
        });
      }
    }

    if (!ruleDataSyncModel || !ruleMetadataSyncModel) {
      throw new Error("All Entities not present");
    }

    console.log("[RuleStorageModel.createFromSyncModels]", { ruleDataSyncModel, ruleMetadataSyncModel });
    const storageEntity = RuleStorageModel.createStorageEntityFromSyncModels(ruleDataSyncModel, ruleMetadataSyncModel);

    return new RuleStorageModel(storageEntity, ruleDataSyncModel.entity.workspaceId);
  }

  static createStorageEntityFromSyncModels(
    ruleDataSyncModel: RuleDataSyncModel,
    ruleMetadataSyncModel: RuleMetadataSyncModel
  ) {
    const storageEntity: StorageRecord = {
      id: ruleDataSyncModel.entity.id,

      ...ruleMetadataSyncModel.entity.data,
      ...ruleDataSyncModel.entity.data,

      createdAt: ruleDataSyncModel.entity.createdAt,
      updatedAt: ruleDataSyncModel.entity.updatedAt,
      createdBy: ruleDataSyncModel.entity.createdBy,
      updatedBy: ruleDataSyncModel.entity.updatedBy,
    } as StorageRecord;

    return storageEntity;
  }

  static async subscribe(callback: (rules: RuleStorageModel[]) => void) {
    const unsub1 = await RuleDataSyncModel.subscribe(async (ruleDataSyncModels: RuleDataSyncModel[]) => {
      // Reduces no of queries on rxdb
      // FIXME-multi-workspace: This logic won't work for multi-workspace
      const allRuleMetadata = await RuleMetadataSyncModel.getAll(ruleDataSyncModels?.[0]?.entity.workspaceId);
      const allRuleMetadataMap: Record<string, RuleMetadataSyncModel> = {};
      allRuleMetadata.forEach((ruleMetadata) => {
        allRuleMetadataMap[ruleMetadata.entity.id] = ruleMetadata;
      });
      //

      console.log("[RuleStorageModel.subscribe] RuleDataSyncModel", {
        allRuleMetadata,
        allRuleMetadataMap,
        ruleDataSyncModels,
      });

      const ruleStorageModelPromises = ruleDataSyncModels.map(async (ruleDataSyncModel) => {
        return await RuleStorageModel.createFromSyncModels(
          ruleDataSyncModel,
          allRuleMetadataMap[ruleDataSyncModel.entity.id] || undefined
        );
      });

      Promise.allSettled(ruleStorageModelPromises).then((results: PromiseSettledResult<RuleStorageModel>[]) => {
        const fulfilledValues = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
        const rejectedReasons = results.filter((result) => result.status === "rejected").map((result) => result.status);

        console.log("[RuleStorageModel.subscribe] RuleDataSyncModel", { fulfilledValues, rejectedReasons });
        // super.onUpdateHook?.(fulfilledValues); // Not needed during subscription. Only needed when user saves the rule
        callback(fulfilledValues);
      });
    });

    const unsub2 = await RuleMetadataSyncModel.subscribe(async (ruleMetadataSyncModels: RuleMetadataSyncModel[]) => {
      // Reduces no of queries on rxdb
      // FIXME: Can be improved
      const allRuleData = await RuleDataSyncModel.getAll(ruleMetadataSyncModels?.[0]?.entity.workspaceId);
      const allRuleDataMap: Record<string, RuleDataSyncModel> = {};
      allRuleData.forEach((ruleData) => {
        allRuleDataMap[ruleData.entity.id] = ruleData;
      });
      //

      console.log("[RuleStorageModel.subscribe] RuleMetadataSyncModel", {
        allRuleData,
        allRuleDataMap,
        ruleMetadataSyncModels,
      });

      const ruleStorageModelPromises = ruleMetadataSyncModels.map(async (ruleMetadataSyncModel) => {
        return await RuleStorageModel.createFromSyncModels(
          allRuleDataMap[ruleMetadataSyncModel.entity.id] || undefined,
          ruleMetadataSyncModel
        );
      });

      Promise.allSettled(ruleStorageModelPromises).then((results: PromiseSettledResult<RuleStorageModel>[]) => {
        const fulfilledValues = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
        const rejectedReasons = results.filter((result) => result.status === "rejected").map((result) => result.status);

        console.log("[RuleStorageModel.subscribe] RuleMetadataSyncModel", {
          fulfilledValues,
          rejectedReasons,
        });
        // super.onUpdateHook?.(fulfilledValues); // Not needed during subscription. Only needed when user saves the rule
        callback(fulfilledValues);
      });
    });

    return () => {
      // @ts-ignore
      unsub1?.();
      // @ts-ignore
      unsub2?.();
    };
  }
}
