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
    commonPullStream$?: Subject<any>;
    collectionPullStreamMap: {
        [key in SyncEntityType]?: Subject<any>;
    } = {};
    pullStreamEventSource?: EventSource;
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

    // _createSSEEventSource = () => {
    //   console.log("[SyncWorkspace._createSSEEventSource]", this._data.id);
    //   const pullStreamUrl = `${this.replicationConfig?.baseUrl}/${this._data.id}/pull-stream/?authToken=${this.authToken}`;

    //   const eventSource = new EventSource(pullStreamUrl, {
    //     withCredentials: false,
    //   });
    //   eventSource.onerror = (error) => {
    //     this.commonPullStream$.next("RESYNC");
    //     console.log("[SyncWorkspace._setupReplication] PullStreamError", error);
    //   };
    //   eventSource.onmessage = (event) => {
    //     const eventData = JSON.parse(event.data);
    //     console.log("[SyncWorkspace._setupReplication] commonPullStream onMessage", { eventData });
    //     this.commonPullStream$.next(eventData);
    //   };
    //   this.pullStreamEventSource = eventSource;
    // };

    // _setupCommonPullStream() {
    //   console.log(`[SyncWorkspace._setupCommonPullStream] Start`);

    //   const pullStream$ = new Subject();
    //   this.commonPullStream$ = pullStream$;
    //   this._createSSEEventSource();

    //   console.log(`[SyncWorkspace._setupCommonPullStream] End`);
    // }

    // _createCollectionReplicationStream(collectionType: SyncEntityType): Subject<any> {
    //   if (!this.commonPullStream$) {
    //     this._setupCommonPullStream();
    //   }

    //   const collectionStream$ = new Subject<any>();

    //   this.commonPullStream$?.subscribe((event) => {
    //     console.log(`[SyncWorkspace._setupReplication] collectionType:${collectionType} pullStream`, { event });
    //     if (event === "RESYNC") {
    //       collectionStream$.next(event);
    //     } else {
    //       console.log("[SyncWorkspace._setupReplication] pullStream", event);
    //       const allDocuments = event?.entities || [];
    //       const filteredDocuments = allDocuments.filter((doc: any) => doc.type === collectionType);
    //       const checkpoint = event.checkpoint;

    //       console.log(`[SyncWorkspace._setupReplication] collectionType:${collectionType} pullStream filteredDocuments`, {
    //         event,
    //         filteredDocuments,
    //       });

    //       if (filteredDocuments.length > 0) {
    //         collectionStream$.next({
    //           documents: filteredDocuments,
    //           checkpoint: checkpoint,
    //         });
    //       }
    //     }
    //   });
    //   return collectionStream$;
    // }

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

        // if (!this.replicationConfig?.enabled) {
        //   console.log("[SyncWorkspace._setupReplication]", "Replication is off");
        //   return;
        // }

        if (!this.collections[entityType]) {
            console.error("[SyncWorkspace._setupReplication] Collection not found", {
                collectionType: entityType,
            });
            return;
        }

        const replication = new RDBReplication(this, entityType);
        replication.init();
        replication.start();

        // TODO: Make it generic and use API_GATEWAY_URL
        // const pushUrl = `${this.replicationConfig.baseUrl}/${this._data.id}/push/`;
        // const pullUrl = `${this.replicationConfig.baseUrl}/${this._data.id}/pull/`;

        // const collectionStream$ = this._createCollectionReplicationStream(entityType);
        // this.collectionPullStreamMap[entityType] = collectionStream$;

        // const self = this;
        // this.replicationState[entityType] = replicateRxCollection({
        //   autoStart: false,
        //   collection: this.collections[entityType],
        //   replicationIdentifier: `${this._data.id}-${entityType}-replication`,
        //   push: {
        //     // @ts-ignore
        //     handler:
        //       entityType === SyncEntityType.RULE_DATA
        //         ? pushRuleDataHandler
        //         : entityType === SyncEntityType.RULE_METADATA
        //         ? pushRuleMetadataHandler
        //         : () => {},
        //   },
        //   // {
        //   //   async handler(changedRows) {
        //   //     console.log("[SyncWorkspace] Push start", {
        //   //       entityType,
        //   //       changedRows,
        //   //     });
        //   //     const rawResponse = await fetch(pushUrl, {
        //   //       method: "POST",
        //   //       headers: {
        //   //         Accept: "application/json",
        //   //         "Content-Type": "application/json",
        //   //         Authorization: self.authToken ?? "",
        //   //       },
        //   //       body: JSON.stringify({
        //   //         entityType,
        //   //         changedRows,
        //   //       }),
        //   //     });
        //   //     const conflictsArray = await rawResponse.json();
        //   //     console.log("[SyncWorkspace] Push end", { conflictsArray });
        //   //     return conflictsArray;
        //   //   },
        //   // },
        //   pull: {
        //     // @ts-ignore
        //     handler:
        //       entityType == SyncEntityType.RULE_DATA
        //         ? pullRuleDataHandler
        //         : entityType == SyncEntityType.RULE_METADATA
        //         ? pullRuleMetadataHandler
        //         : () => ({
        //             documents: [],
        //             checkpoint: 0,
        //           }),
        //     stream$:
        //       entityType === SyncEntityType.RULE_DATA
        //         ? setupRuleDataPullStreamListener().asObservable()
        //         : entityType === SyncEntityType.RULE_METADATA
        //         ? setupRuleMetaPullStreamListener().asObservable()
        //         : undefined,
        //   },
        //   // {
        //   //   async handler(checkpointOrNull: any, batchSize: number) {
        //   //     console.log("[SyncWorkspace] Pull start", {
        //   //       checkpointOrNull,
        //   //       batchSize,
        //   //     });
        //   //     const checkpoint = checkpointOrNull ? checkpointOrNull : {};
        //   //     checkpoint.lastUpdatedTs = checkpoint.lastUpdatedTs || 0;
        //   //     const response = await fetch(
        //   //       `${pullUrl}?checkpoint_lastUpdatedTs=${checkpoint.lastUpdatedTs}&batchSize=${batchSize}&entityType=${entityType}`,
        //   //       {
        //   //         headers: {
        //   //           Authorization: self.authToken ?? "",
        //   //         },
        //   //       }
        //   //     );
        //   //     const collectionData = await response.json();
        //   //     console.log("[SyncWorkspace] Pull end", { collectionData });
        //   //     return {
        //   //       documents: collectionData.entities,
        //   //       checkpoint: collectionData.checkpoint,
        //   //     };
        //   //   },
        //   //   stream$: collectionStream$.asObservable() as Observable<any>,
        //   // },
        // });

        // Causing Multiple Push Calls thats why removed; But not if autostart is false
        console.log("[SyncWorkspace._setupReplication] Starting Replication", { entityType });
        // this.replicationState[entityType].start();
        // replicationState.received$.subscribe(doc => console.log({ doc }));
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
