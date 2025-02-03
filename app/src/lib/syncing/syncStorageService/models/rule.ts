import { RuleDataSyncEntity, RuleMetadataSyncEntity } from "@requestly/shared/types/syncEntities/rules";
import { StorageModel } from ".";
import { RuleDataSyncModel } from "../../syncEngine/models/ruleData";
import { RuleMetadataSyncModel } from "../../syncEngine/models/ruleMetadata";
import { StorageRecord } from "@requestly/shared/types/entities/rules";

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
      status: data.status,
      isFavourite: data.isFavourite,
      createdAt: data.createdAt || 0,
      updatedAt: data.updatedAt || 0,
      createdBy: data.createdBy || "",
      updatedBy: data.updatedBy || "",
    };
    this.ruleMetadataSyncModel = new RuleMetadataSyncModel(ruleMetadataEntity, workspaceId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, isFavourite, ..._ruleDataEntity } = data;
    const ruleDataEntity: RuleDataSyncEntity = {
      ..._ruleDataEntity,
      createdAt: data.createdAt || 0,
      updatedAt: data.updatedAt || 0,
      createdBy: data.createdBy || "",
      updatedBy: data.updatedBy || "",
    };
    this.ruleDataSyncModel = new RuleDataSyncModel(ruleDataEntity, workspaceId);
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
        ruleMetadataSyncModel.workspaceId
      );
    }

    if (ruleDataSyncModel && !ruleMetadataSyncModel) {
      ruleMetadataSyncModel = await RuleMetadataSyncModel.get(
        ruleDataSyncModel.entity.id,
        ruleDataSyncModel.workspaceId
      );
    }

    if (!ruleDataSyncModel || !ruleMetadataSyncModel) {
      throw new Error("All Entities not present");
    }

    console.log("[RuleStorageModel.createFromSyncModels]", { ruleDataSyncModel, ruleMetadataSyncModel });
    const storageEntity = RuleStorageModel.createStorageEntityFromSyncModels(ruleDataSyncModel, ruleMetadataSyncModel);

    return new RuleStorageModel(storageEntity, ruleDataSyncModel?.workspaceId);
  }

  static createStorageEntityFromSyncModels(
    ruleDataSyncModel: RuleDataSyncModel,
    ruleMetadataSyncModel: RuleMetadataSyncModel
  ) {
    const storageEntity: StorageRecord = {
      ...ruleMetadataSyncModel.entity,
      ...ruleDataSyncModel.entity,
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
      const allRuleMetadata = await RuleMetadataSyncModel.getAll(ruleDataSyncModels?.[0]?.workspaceId);
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
      const allRuleData = await RuleDataSyncModel.getAll(ruleMetadataSyncModels?.[0]?.workspaceId);
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

        console.log("[RuleStorageModel.subscribe] RuleMetadataSyncModel", { fulfilledValues, rejectedReasons });
        // super.onUpdateHook?.(fulfilledValues); // Not needed during subscription. Only needed when user saves the rule
        callback(fulfilledValues);
      });
    });

    return () => {
      unsub1?.();
      unsub2?.();
    };
  }
}
