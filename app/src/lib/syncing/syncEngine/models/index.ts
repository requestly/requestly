import { SyncEntity, SyncEntityType } from "@requestly/shared/types/syncEntities";
import { syncEngine } from "..";

export class SyncModel<U extends SyncEntity> {
  static entityType: SyncEntityType;

  entity: U;

  constructor(data: U) {
    this.entity = data;
  }

  updateEntity(data: U) {
    this.entity = data;
  }

  async save() {
    const updatedEntity = await syncEngine.upsert(this);

    // TODO-syncing: Handle errors more gracefully when updatedEntity is undefined. In case of conflicts, this might handle all those cases
    if (updatedEntity) {
      // Updating the entity so that it can be used after this
      this.entity = updatedEntity as U;
    }
  }

  delete() {
    syncEngine.delete(this);
  }

  // TODO: Improve types
  static async subscribe(callback: (models: SyncModel<any>[]) => void): Promise<(() => void) | void> {
    console.log("[SyncModel.subscribe]", { entityType: this.entityType });
    const unsubscribe = syncEngine.subscribe(this.entityType, (entities: SyncEntity[]) => {
      const models = entities.map((entity) => new this(entity));
      callback(models);
    });
    return unsubscribe;
  }

  // TODO: Improve Types
  static async get(id: string, workspaceId: string): Promise<SyncModel<any> | undefined> {
    console.log("[SyncModel.get]", { entityType: this.entityType });
    const syncEntity = await syncEngine.get(id, this.entityType, workspaceId);

    if (syncEntity) {
      console.log("[SyncModel.get] Entity found", { id, entityType: this.entityType, workspaceId, syncEntity });
      return new this(syncEntity);
    }

    console.error("[SyncModel.get] Entity not found", { id, entityType: this.entityType, workspaceId });
    return;
  }

  static async getAll(workspaceId: string): Promise<SyncModel<any>[]> {
    console.log("[SyncModel.getAll]", { entityType: this.entityType });
    const entities = await syncEngine.getAll(this.entityType, workspaceId);

    return entities.map((entity) => new this(entity));
  }
}
