import SyncWorkspace from "./syncWorkspace";
import { SyncModel } from "./models";
import { SyncEntityType, syncTypeToEntityMap } from "@requestly/shared/types/syncEntities";
import { SyncEntity } from "@requestly/shared/types/syncEntities";
import { RxDocument } from "rxdb";
import { Subscription } from "rxjs";
import { ReplicationConfig } from "./types";

interface WorkspaceConfig {
  id: string;
  replication?: ReplicationConfig;
}

class SyncEngine {
  syncWorkspacesMap: {
    [workspaceId: string]: SyncWorkspace;
  } = {};
  initInProgress: boolean = false;
  initialized: boolean = false;
  authToken?: string = undefined;
  userId?: string = undefined;

  async init(workspacesConfig: WorkspaceConfig[], userId?: string, authToken?: string) {
    if (this.initInProgress) {
      return;
    }
    this.initInProgress = true;
    this.authToken = authToken;
    this.userId = userId;

    console.log("[SyncEngine.init] Start", { workspacesConfig, authToken });
    await Promise.all(
      workspacesConfig.map(async (workspaceConfig: WorkspaceConfig) => {
        if (this.syncWorkspacesMap[workspaceConfig.id]) {
          console.log("[SyncEngine.init] Workspace Already Init", { workspaceId: workspaceConfig.id });
          return;
        }
        await this.initWorkspace(workspaceConfig);
      })
    );
    this.initInProgress = false;
    this.initialized = true;
    console.log("[SyncEngine.init] Done");
  }

  async initAuthToken(authToken?: string) {
    console.debug("[SyncEngine.initAuthToken]", { authToken });
    this.authToken = authToken;
    Object.values(this.syncWorkspacesMap).forEach((syncWorkspace) => {
      syncWorkspace.initAuthToken(authToken);
    });
  }

  async initWorkspace(workspaceConfig: WorkspaceConfig) {
    this.syncWorkspacesMap[workspaceConfig.id] = await SyncWorkspace.create(
      workspaceConfig.id,
      workspaceConfig?.replication,
      this.userId,
      this.authToken
    );
  }

  disconnectWorkspace(workspaceId: string) {
    this.initialized = false;
    this.syncWorkspacesMap[workspaceId]?.disconnect();
    delete this.syncWorkspacesMap[workspaceId];
  }

  async subscribe(entityType: SyncEntityType, callback: (syncEntities: any[], workspaceId: string) => void) {
    console.log("[SyncEngine.subscribe]", { entityType }, this.syncWorkspacesMap);
    const subs: Subscription[] = [];

    Object.values(this.syncWorkspacesMap).forEach(async (syncWorkspace) => {
      const subscription: Subscription | undefined = await syncWorkspace.subscribeToCollection(
        entityType,
        async (syncEntityDocs) => {
          const syncEntities: SyncEntity[] = syncEntityDocs.map((doc) => {
            return doc.toJSON() as SyncEntity;
          });
          callback(syncEntities, syncWorkspace.workspaceId);
        }
      );

      if (subscription) {
        subs.push(subscription);
      }
    });

    return () => {
      subs.forEach((sub) => {
        console.log("[Debug] Calling unsubs", sub);
        sub.unsubscribe?.();
      });
    };
  }

  /** CRUD **/
  async upsert(syncModel: SyncModel<SyncEntity>): Promise<SyncEntity | undefined> {
    try {
      console.log("[SyncEngine.upsert]", {
        entity: syncModel.entity,
        entityType: (syncModel.constructor as typeof SyncModel).entityType,
        syncWorkspaceMap: this.syncWorkspacesMap,
      });
      const syncWorkspace = this.syncWorkspacesMap[syncModel.entity.workspaceId];
      // FIXME: Type any needs to be fixed
      const updatedDataDoc = await syncWorkspace.collections[syncModel.entity.type]?.upsert(syncModel.entity as any);
      const updatedData = updatedDataDoc?.toJSON() as SyncEntity;
      console.log("[SyncEngine.upsert] Done", { updatedData });
      return updatedData;
    } catch (error) {
      console.log("[SyncEngine.upsert] Error", error);
    }
  }

  async delete(syncModel: SyncModel<SyncEntity>) {
    console.log("[SyncEngine.delete]", {
      entity: syncModel.entity,
      entityType: (syncModel.constructor as typeof SyncModel).entityType,
    });

    const syncWorkspace = this.syncWorkspacesMap[syncModel.entity.workspaceId];

    await syncWorkspace.collections[(syncModel.constructor as typeof SyncModel).entityType]
      ?.findOne({
        selector: {
          id: syncModel.entity.id,
        },
      })
      .exec()
      .then((document) => {
        console.log("[SyncEngine.delete] Document", document);
        document?.remove();
      });
  }

  async get(
    id: string,
    entityType: SyncEntityType,
    workspaceId: string
  ): Promise<syncTypeToEntityMap[typeof entityType] | undefined> {
    if (!workspaceId) {
      return;
    }

    const syncWorkspace = this.syncWorkspacesMap[workspaceId];
    const syncEntityDoc: RxDocument<SyncEntity> | unknown = await syncWorkspace.collections[entityType]
      ?.findOne({
        selector: {
          id: id,
        },
      })
      .exec();

    if (syncEntityDoc) {
      console.log("[SyncEngine.get", { id, entityType, workspaceId, syncEntityDoc });
      return (syncEntityDoc as RxDocument)?.toJSON() as any;
    }
    return;
  }

  async getAll(entityType: SyncEntityType, workspaceId: string): Promise<syncTypeToEntityMap[typeof entityType][]> {
    if (!workspaceId) {
      return [];
    }

    const syncWorkspace = this.syncWorkspacesMap[workspaceId];
    const syncEntityDocs: RxDocument<SyncEntity, any>[] | undefined = await syncWorkspace.collections[entityType]
      ?.find()
      .exec();

    if (!syncEntityDocs) {
      return [];
    }

    return syncEntityDocs.map((doc) => doc.toJSON() as any);
  }
}

export const syncEngine = new SyncEngine();
