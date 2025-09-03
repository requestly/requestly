import { addRxPlugin, createRxDatabase, deepEqual, RxCollection, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema";
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup";
import { Subscription } from "rxjs";
import { omit } from "lodash";

import { ruleDataSchema } from "./schemas/ruleData";
import { ruleMetadataSchema } from "./schemas/ruleMetadata";
import { SyncEntityType, syncTypeToEntityMap } from "@requestly/shared/types/syncEntities";
import { Workspace } from "features/workspaces/types";
import RDBReplication from "./replication/rdb";
import BaseReplication from "./replication/base";

addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBCleanupPlugin);

class SyncWorkspace {
    _config: Workspace;
    userId: string | undefined;
    database!: RxDatabase;
    collections: {
        [key in SyncEntityType]: RxCollection<syncTypeToEntityMap[key]>;
    };
    replication: Partial<Record<SyncEntityType, BaseReplication<SyncEntityType>>>;

    // Don't use this constructor to instantiate. Use static create method instead.
    constructor(workspaceConfig: Workspace, userId: string | undefined = undefined) {
        this._config = workspaceConfig;
        this.userId = userId;
        this.replication = {};
    }

    static async create(workspaceConfig: Workspace, userId?: string, authToken?: string): Promise<SyncWorkspace> {
        const syncWorkspace = new SyncWorkspace(workspaceConfig, userId);
        await syncWorkspace.init();
        return syncWorkspace;
    }

    private async init() {
        console.log("[SyncWorkspace.init] Start");
        await this.initRxDB();
        await this.connect();
        console.log("[SyncWorkspace.init] Done");
    }

    async connect() {
        console.log("[SyncWorkspace.connect] Start", this._config.id);
        await this._setupReplication();
        console.log("[SyncWorkspace.connect] Done");
    }

    async disconnect() {
        console.log("[SyncWorkspace.disconnect] Start", this._config.id);
        await this._stopReplication();
        await this.database.close();
        console.log("[SyncWorkspace.disconnect] Done", this._config.id);
    }

    private async initRxDB() {
        console.log("[SyncWorkspace.initRxDB] Start");
        // #region - Database Init
        this.database = await createRxDatabase({
            name: `sync-db${this.userId ? "-" + this.userId : ""}-${this._config.id}`,
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
                    plainData.createdBy = this.userId;
                    plainData.updatedBy = this.userId;
                    plainData.createdAt = Date.now();
                    plainData.updatedAt = Date.now();
                    console.log(`[SyncWorkspace.collections.${entityType}.preinsert] New`, { plainData });
                }
            }, false);

            this.collections[entityType]?.preSave((plainData, rxDocument) => {
                console.log(`[SyncWorkspace.collections.${entityType}.preSave] Before Omit`, { plainData, rxDocument });
                const omitKeys = [
                    "createdAt",
                    "updatedAt",
                    "createdBy",
                    "updatedBy",
                    "_meta",
                    "_rev",
                    "_attachments",
                    "type",
                ];
                const _plainData = omit(plainData, omitKeys);
                const _rxDocument = omit(rxDocument, omitKeys);
                console.log(`[SyncWorkspace.collections.${entityType}.preSave] After Omit`, {
                    _plainData,
                    _rxDocument,
                });
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

    private async _setupReplication() {
        if (this._config.isSyncEnabled) {
            await Promise.all(
                Object.values(SyncEntityType).map(async (entityType) => {
                    await this._setupReplicationForEntity(entityType);
                })
            );
        } else {
            console.log("[SyncWorkspace._setupReplication] Sync is disabled for workspace", {
                workspaceId: this._config.id,
                workspaceType: this._config.workspaceType,
            });
        }
    }

    private async _setupReplicationForEntity<K extends SyncEntityType>(entityType: K) {
        console.log("[SyncWorkspace._setupReplication] Start", { entityType });
        if (this._config.isSyncEnabled) {
            if (!this.replication?.[entityType]) {
                const replication = new RDBReplication(this, entityType);
                await replication.init();
                await replication.start();
                // @ts-ignore
                this.replication[entityType] = replication;
            } else {
                console.error("[SyncWorkspace._setupReplicationForEntity] Replication already exists", { entityType });
            }
        } else {
            console.log("[SyncWorkspace._setupReplicationForEntity] Sync is disabled for workspace", {
                workspaceId: this._config.id,
                workspaceType: this._config.workspaceType,
            });
        }
        console.log("[SyncWorkspace._setupReplication] End", { entityType });
    }

    private async _stopReplication() {
        console.log("[SyncWorkspace.stopReplication]", this._config.id);
        this.replication[SyncEntityType.RULE_DATA]?.stop();
        this.replication[SyncEntityType.RULE_METADATA]?.stop();
        this.replication = {};
        console.log("[SyncWorkspace.stopReplication] Done", this._config.id);
    }

    async subscribeToCollection(
        entityType: SyncEntityType,
        callback: (docs: any[]) => void
    ): Promise<undefined | Subscription> {
        console.log("[SyncWorkspace.subscribeToCollection] Start", { entityType }, this._config.id);
        const collection = this.collections[entityType];
        if (!collection) {
            console.error("[SyncWorkspace.subscribeToCollection] Collection not found", { entityType });
            return;
        }

        const subscription: Subscription = collection
            ?.find()
            // @ts-expect-error - Ignore
            .$.subscribe(async (docs) => {
                console.log("observable", this._config.id, docs);
                callback(docs);
            });

        return subscription;
    }
}

export default SyncWorkspace;
