import { addRxPlugin, createRxDatabase, deepEqual, RxCollection, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema";
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup";
import { replicateRxCollection, RxReplicationState } from "rxdb/plugins/replication";
import { Observable, Subject, Subscription } from "rxjs";
import { omit } from "lodash";

import { ruleDataSchema } from "./schemas/ruleData";
import { ruleMetadataSchema } from "./schemas/ruleMetadata";
import { SyncEntityType, syncTypeToEntityMap } from "@requestly/shared/types/syncEntities";
import { Workspace } from "features/workspaces/types";
import RDBReplication from "./replication/rdb";

addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBCleanupPlugin);
class SyncWorkspace {
  _data: Workspace;
  userId: string | undefined;
  authToken: string | undefined = "";
  database: RxDatabase | null;
  collections: {
    [key in SyncEntityType]?: RxCollection<syncTypeToEntityMap[key]> | null;
  };

  /** Subscriptions */
  replicationState: {
    [key in SyncEntityType]?: RxReplicationState<any, any> | null;
  } = {};

  // Don't use this constructor to instantiate. Use static create method instead.
  constructor(workspace: Workspace, userId: string | undefined = undefined, authToken: string = "") {
    this.userId = userId;
    this.authToken = authToken;
    this._data = workspace;
    this.database = null;
    this.collections = {};
    this._data = workspace;
  }

  static async create(workspace: Workspace, userId?: string, authToken?: string): Promise<SyncWorkspace> {
    const syncWorkspace = new SyncWorkspace(workspace, userId, authToken);
    await syncWorkspace.init();
    return syncWorkspace;
  }

  async init() {
    console.log("[SyncWorkspace.init] Start", {
      workspaceId: this._data.id,
      userId: this.userId,
      authToken: this.authToken,
    });
    await this.initRxDB();
    await this.connect();
    console.log("[SyncWorkspace.init] Done", { workspaceId: this._data.id });
  }

  async initAuthToken(authToken?: string) {
    if (this.authToken === authToken) {
      if (Object.keys(this.replicationState).length > 0) {
        console.log("[SyncWorkspace.initAuthToken] Same authToken and replication setup done", {
          oldAuthToken: this.authToken,
          authToken,
        });
      } else {
        console.log("[SyncWorkspace.initAuthToken] Same authToken but replication setup not done", {
          authToken,
        });
        this._setupReplication();
      }
    } else {
      console.log("[SyncWorkspace.initAuthToken] Different authToken", {
        oldAuthToken: this.authToken,
        authToken,
      });
      // Auth Token Changed
      this.authToken = authToken;
      await this._stopReplication();
      await this._setupReplication();
    }
  }

  async initRxDB() {
    console.log("[SyncWorkspace.initRxDB] Start", {
      workspaceId: this._data.id,
    });
    // #region - Database Init
    this.database = await createRxDatabase({
      name: `sync-db${this.userId ? "-" + this.userId : ""}-${this._data.id}`,
      storage: getRxStorageDexie(),
      cleanupPolicy: {
        minimumDeletedTime: 7 * 24 * 60 * 60 * 1000, // 7 days
        runEach: 1000 * 60 * 5, // 5 minutes
      },
    });

    this.collections = await this.database.addCollections({
      [SyncEntityType.RULE_DATA]: {
        schema: ruleDataSchema,
        migrationStrategies: {
          1: function (oldDoc) {
            return oldDoc;
          },
        },
      },
      [SyncEntityType.RULE_METADATA]: {
        schema: ruleMetadataSchema,
        migrationStrategies: {
          1: function (oldDoc) {
            return oldDoc;
          },
        },
      },
    });
    // #endregion

    // #region - PreInsert and PreSave Hooks
    Object.values(SyncEntityType).forEach((entityType) => {
      this.collections[entityType]?.preInsert((plainData) => {
        console.log(`[SyncWorkspace.collections.${entityType}.preinsert]`, { plainData });

        // New Document
        if (!plainData?.createdAt || !plainData?.createdBy) {
          // TODO-syncing: Change this to userId;
          plainData.createdBy = this.userId;
          plainData.updatedBy = this.userId;
          plainData.createdAt = Date.now();
          plainData.updatedAt = Date.now();
          console.log(`[SyncWorkspace.collections.${entityType}.preinsert] New`, { plainData });
        }
      }, false);

      this.collections[entityType]?.preSave((plainData, rxDocument) => {
        console.log(`[SyncWorkspace.collections.${entityType}.preSave]`, { plainData, rxDocument });
        const _plainData = omit(plainData, [
          "forkId",
          "isGlobal",
          "createdAt",
          "updatedAt",
          "createdBy",
          "updatedBy",
          "_meta",
          "_rev",
          "_attachments",
          "type",
        ]);
        const _rxDocument = omit(rxDocument, [
          "forkId",
          "isGlobal",
          "createdAt",
          "updatedAt",
          "createdBy",
          "updatedBy",
          "_meta",
          "_rev",
          "_attachments",
        ]);
        console.log(`[SyncWorkspace.collections.${entityType}.preSave]`, { _plainData, _rxDocument });
        const isEqual = deepEqual(_plainData, _rxDocument);
        if (isEqual) {
          console.log(`[SyncWorkspace.collections.${entityType}.preSave] Stop`, {
            plainData,
            _plainData,
            rxDocument,
            _rxDocument,
            isEqual,
          });
          throw new Error("stop");
        }

        // Updated
        plainData.updatedBy = this.userId;
        plainData.updatedAt = Date.now();
        console.log(`[SyncWorkspace.collections.${entityType}.preSave] Updated`, { plainData });
      }, false);
    });

    // #endregion

    console.log("[SyncWorkspace.initRxDB] Done", {
      database: this.database,
      collections: this.collections,
    });
  }

  async connect() {
    console.log("[SyncWorkspace.connect] Start", this._data.id);
    await this._setupReplication();
    console.log("[SyncWorkspace.connect] Done");
  }

  async disconnect() {
    // Disconnect from the workspace for Sync
    console.log("[SyncWorkspace.disconnect] Start", this._data.id);
    await this._stopReplication();
    this.database.close();
    console.log("[SyncWorkspace.disconnect] Done", this._data.id);
  }

  async _setupReplication() {
    await Promise.all(
      Object.values(SyncEntityType).map(async (collectionType) => {
        await this._setupReplicationForEntity(collectionType);
      })
    );
  }

  async _setupReplicationForEntity(entityType: SyncEntityType) {
    console.log("[SyncWorkspace._setupReplication]", { collectionType: entityType });

    if (!this.userId) {
      console.log("[SyncWorkspace._setupReplication]", "No userId. Skipping Replication");
      return;
    }

    if (!this.authToken) {
      console.log("[SyncWorkspace._setupReplication]", "No authToken. Skipping Replication");
      return;
    }

    if (!this.collections[entityType]) {
      console.error("[SyncWorkspace._setupReplication] Collection not found", {
        collectionType: entityType,
      });
      return;
    }

    const replication = new RDBReplication(this, entityType);
    replication.init();
    replication.start();

    console.log("[SyncWorkspace._setupReplication] Starting Replication", { entityType });
  }

  async _stopReplication() {
    console.log("[SyncWorkspace.stopReplication]", this._data.id);
    this.pullStreamEventSource?.close();
    this.pullStreamEventSource = undefined;
    this.commonPullStream$?.complete();
    this.commonPullStream$ = undefined;
    Object.values(this.collectionPullStreamMap).forEach((collectionSubject) => {
      collectionSubject.complete();
    });
    this.collectionPullStreamMap = {};
    this.replicationState[SyncEntityType.RULE_DATA]?.cancel();
    this.replicationState[SyncEntityType.RULE_METADATA]?.cancel();
    this.replicationState = {};
    console.log("[SyncWorkspace.stopReplication] Done", this._data.id);
  }

  async subscribeToCollection(
    entityType: SyncEntityType,
    callback: (docs: any[]) => void
  ): Promise<undefined | Subscription> {
    console.log("[SyncWorkspace.subscribeToCollection] Start", { entityType }, this._data.id);
    const collection = this.collections[entityType];
    if (!collection) {
      console.error("[SyncWorkspace.subscribeToCollection] Collection not found", { entityType });
      return;
    }

    const subscription: Subscription = collection
      ?.find()
      // @ts-expect-error - Ignore
      .$.subscribe(async (docs) => {
        console.log("observable", this._data.id, docs);
        callback(docs);
      });

    return subscription;
  }
}

export default SyncWorkspace;
