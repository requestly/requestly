import {
    RuleDataSyncEntity,
    RuleMetadataSyncEntity,
    SyncEntityType,
    syncTypeToEntityMap,
} from "@requestly/shared/types/syncEntities";
import BaseReplication from "./base";
import { replicateRxCollection } from "rxdb/plugins/replication";
import { WorkspaceType } from "features/workspaces/types";
import { ReplicationPullHandler, ReplicationPushHandler, WithDeletedAndAttachments } from "rxdb";
import { get, getDatabase, ref, update, onValue, Unsubscribe, remove } from "firebase/database";
import firebaseApp from "firebase";
import { Subject, Subscription } from "rxjs";
import { RecordStatus } from "@requestly/shared/types/entities/rules";

const db = getDatabase(firebaseApp);

type RuleDataRdbSchema = RuleDataSyncEntity["data"] & {
    // Old Properties
    creationDate?: number;
    modificationDate?: number;
    createdBy?: string;
    lastModifiedBy?: string;
    // New Properties
    createdAt?: number;
    updatedAt?: number;
    // createdBy?: string;
    updatedBy?: string;
};

type RuleMetadataRdbSchema = RuleMetadataSyncEntity["data"] & {
    // Old Properties from RuleData
    creationDate?: number;
    modificationDate?: number;
    createdBy?: string;
    lastModifiedBy?: string;
    // New Properties
    createdAt?: number;
    updatedAt?: number;
    // createdBy?: string;
    updatedBy?: string;
};

class RDBReplication<T extends SyncEntityType> extends BaseReplication<T> {
    unsubListener?: Unsubscribe = undefined;

    public localEntityIds: Set<string> = new Set();
    collectionSubscription: Subscription | undefined = undefined;

    async init() {
        if (this.collection) {
            this.replicationState = replicateRxCollection({
                autoStart: false,
                collection: this.collection as any, // TEMP
                replicationIdentifier: `${this.syncWorkspace._config.id}-${this.syncEntityType}-replication`,
                push: {
                    handler: this.pushHandler(),
                },
                pull: {
                    handler: this.pullHandler(),
                    stream$: this.pullStreamListener(),
                },
            });
            await this.initAvailableEntityIdsListener();
            this.isInitialized = true;
        } else {
            throw new Error(`No collection for Replication entityType: ${this.syncEntityType}`);
        }
    }

    private initAvailableEntityIdsListener = async () => {
        this.collectionSubscription = this.collection.find().$.subscribe((docs) => {
            this.localEntityIds = new Set(docs.map((doc) => doc.id));
            console.log("[RDBReplication.initAvailableEntityIdsListener] currentEntityIds:", this.localEntityIds);
        });
    };

    async start(): Promise<void> {
        if (this.isInitialized) {
            await this.replicationState.start();
            await this.replicationState.awaitInitialReplication();
        } else {
            console.error(`RDBReplication not initialized for entityType: ${this.syncEntityType}`);
        }
    }

    async stop(): Promise<void> {
        if (this.isInitialized) {
            await this.replicationState.cancel();
            this.unsubListener?.();
        } else {
            console.error(`RDBReplication not initialized for entityType: ${this.syncEntityType}`);
        }
    }

    // #region - Push
    private pushHandler = (): ReplicationPushHandler<syncTypeToEntityMap[keyof syncTypeToEntityMap]> => {
        switch (this.syncEntityType) {
            case SyncEntityType.RULE_DATA:
                return this.pushRuleDataHandler;
            case SyncEntityType.RULE_METADATA:
                return this.pushRuleMetadataHandler;
            default:
                throw Error(`[RDBReplication.pushHandler] Invalid SyncEntityType  ${this.syncEntityType}`);
        }
    };

    private pushRuleDataHandler: ReplicationPushHandler<RuleDataSyncEntity> = async (changedRows) => {
        const conflicts: WithDeletedAndAttachments<RuleDataSyncEntity>[] = [];
        const updatedEntities: WithDeletedAndAttachments<RuleDataSyncEntity>[] = [];

        changedRows.forEach((changedRow) => {
            if (changedRow.assumedMasterState?._deleted && !changedRow.newDocumentState._deleted) {
                console.log("[RDBReplication.pushRuleDataHandler] Conflict detected:", changedRow);
                conflicts.push(changedRow.assumedMasterState);
            } else {
                updatedEntities.push(changedRow.newDocumentState);
            }
        });
        console.log("[`RDBReplication`.pushRuleDataHandler] Final updates:", {
            changedRows,
            updatedEntities,
        });

        const updatePromises = updatedEntities.map((updatedEntity) => {
            if (updatedEntity._deleted) {
                const deleteRef = ref(db, `${this.getRuleDataPath()}/${updatedEntity.id}`);
                return remove(deleteRef);
            } else {
                const updateRef = ref(db, `${this.getRuleDataPath()}/${updatedEntity.id}`);
                return update(updateRef, updatedEntity.data);
            }
        });

        // TODO-cleanup: Should this be allSettled?
        await Promise.allSettled(updatePromises)
            .then((results) => {
                console.log("[RDBReplication.pushRuleDataHandler] Push results:", results);
            })
            .catch((error) => {
                console.error("[RDBReplication.pushRuleDataHandler] Error pushing rule data:", error);
            });

        return conflicts; // TODO-cleanup: Return if any conflicts or errors
    };

    private pushRuleMetadataHandler: ReplicationPushHandler<RuleMetadataSyncEntity> = async (changedRows) => {
        const conflicts: WithDeletedAndAttachments<RuleMetadataSyncEntity>[] = [];
        const updatedEntities: WithDeletedAndAttachments<RuleMetadataSyncEntity>[] = [];
        changedRows.forEach((changedRow) => {
            if (changedRow.assumedMasterState?._deleted && !changedRow.newDocumentState._deleted) {
                console.log("[RDBReplication.pushRuleMetadataHandler] Conflict detected:", changedRow);
                conflicts.push(changedRow.assumedMasterState);
            } else {
                updatedEntities.push(changedRow.newDocumentState);
            }
        });
        console.log("[`RDBReplication`.pushRuleMetadataHandler] Final updates:", {
            changedRows,
            updatedEntities,
        });

        const updatePromises = updatedEntities.map((updatedEntity) => {
            if (updatedEntity._deleted) {
                const deleteRef = ref(db, `${this.getRuleMetadataPath()}/${updatedEntity.id}`);
                return remove(deleteRef);
            } else {
                const updateRef = ref(db, `${this.getRuleMetadataPath()}/${updatedEntity.id}`);
                return update(updateRef, updatedEntity.data);
            }
        });

        // TODO-cleanup: Should this be allSettled?
        await Promise.allSettled(updatePromises)
            .then((results) => {
                console.log("[RDBReplication.pushRuleMetadataHandler] Push results:", results);
            })
            .catch((error) => {
                console.error("[RDBReplication.pushRuleMetadataHandler] Error pushing rule data:", error);
            });

        return conflicts; // TODO-cleanup: Return if any conflicts or errors
    };
    // #endregion

    // #region - Pull
    private pullHandler(): ReplicationPullHandler<syncTypeToEntityMap[keyof syncTypeToEntityMap], number> {
        switch (this.syncEntityType) {
            case SyncEntityType.RULE_DATA:
                return this.pullRuleDataHandler;
            case SyncEntityType.RULE_METADATA:
                return this.pullRuleMetadataHandler;
            default:
                throw Error(`Invalid SyncEntityType  ${this.syncEntityType}`);
        }
    }
    // #endregion

    // @ts-ignore
    private pullRuleDataHandler: ReplicationPullHandler<RuleDataSyncEntity, number> = async () => {
        const ruleDataRef = ref(db, this.getRuleDataPath());

        const rulesData: Record<string, RuleDataRdbSchema> = await get(ruleDataRef).then((snaphot) => {
            if (snaphot.exists()) {
                return snaphot.val();
            }

            return {};
        });

        const documents = this.prepareRuleDataDocumentsFromSnapshot(rulesData);
        return {
            documents,
            checkpoint: null,
        };
    };

    // @ts-ignore
    private pullRuleMetadataHandler: ReplicationPullHandler<RuleMetadataSyncEntity, number> = async () => {
        const ruleMetadataRef = ref(db, this.getRuleMetadataPath());

        const rulesMetadata = await get(ruleMetadataRef).then((snaphot) => {
            if (snaphot.exists()) {
                return snaphot.val();
            }

            return {};
        });

        const documents = this.prepareRuleMetadataDocumentsFromSnapshot(rulesMetadata);
        return {
            documents,
            checkpoint: 0,
        };
    };

    // #region - PullStream
    private pullStreamListener() {
        switch (this.syncEntityType) {
            case SyncEntityType.RULE_DATA:
                return this.setupRuleDataPullStreamListener();
            case SyncEntityType.RULE_METADATA:
                return this.setupRuleMetaDataPullStreamListener();
            default:
                throw Error(`Invalid SyncEntityType for pull stream listener: ${this.syncEntityType}`);
        }
    }

    private setupRuleDataPullStreamListener() {
        const subject = new Subject<any>();

        const ruleDataRef = ref(db, this.getRuleDataPath());

        this.unsubListener = onValue(ruleDataRef, (snapshot) => {
            let rulesData = {};
            if (snapshot.exists()) {
                rulesData = snapshot.val();
            }

            const documents = this.prepareRuleDataDocumentsFromSnapshot(rulesData);
            subject.next({
                documents,
                checkpoint: 0, // TODO Placeholder for checkpoint, can be updated based on your logic
            });
        });

        return subject.asObservable();
    }

    private setupRuleMetaDataPullStreamListener() {
        const subject = new Subject<any>();

        const ruleMetadataRef = ref(db, this.getRuleMetadataPath());

        this.unsubListener = onValue(ruleMetadataRef, (snapshot) => {
            let rulesMetadata = {};
            if (snapshot.exists()) {
                rulesMetadata = snapshot.val();
            }

            const documents = this.prepareRuleMetadataDocumentsFromSnapshot(rulesMetadata);
            subject.next({
                documents,
                checkpoint: null, // TODO Placeholder for checkpoint, can be updated based on your logic
            });
        });

        return subject.asObservable();
    }
    // #endregion

    private getRuleDataPath(): string {
        let refPath = null;
        if (this.syncWorkspace._config.workspaceType === WorkspaceType.PERSONAL) {
            refPath = `sync/${this.syncWorkspace.userId}/records`;
        } else if (this.syncWorkspace._config.workspaceType === WorkspaceType.SHARED) {
            refPath = `teamSync/${this.syncWorkspace._config.id}/records`;
        } else {
            throw new Error(`[RDBReplication] Invalid workspace type ${this.syncWorkspace._config.workspaceType}`);
        }

        return refPath;
    }

    private getRuleMetadataPath(): string {
        let refPath = null;
        if (this.syncWorkspace._config.workspaceType === WorkspaceType.PERSONAL) {
            refPath = `sync/${this.syncWorkspace.userId}/records`;
        } else if (this.syncWorkspace._config.workspaceType === WorkspaceType.SHARED) {
            // TODO: Global Sync pending
            // teamSync/<teamId>/records/<recordId>/status
            // teamSync/<teamId>/records/<recordId>/isFavourite
            refPath = `teamSync/${this.syncWorkspace._config.id}/userConfig/${this.syncWorkspace.userId}/rulesConfig`;
        } else {
            throw new Error(`[RDBReplication] Invalid workspace type ${this.syncWorkspace._config.workspaceType}`);
        }

        return refPath;
    }

    private prepareRuleDataDocumentsFromSnapshot(snapshot: Record<string, RuleDataRdbSchema>): RuleDataSyncEntity[] {
        const finalDocs: RuleDataSyncEntity[] = [];
        const masterEntityIds: Set<string> = new Set(Object.keys(snapshot));

        // Undeleted Docs
        Object.entries(snapshot).forEach(([id, data]: [string, RuleDataRdbSchema]) => {
            finalDocs.push(this.ruleDataRdbToRuleDataDoc(id, data));
        });
        console.log("[RDBReplication.prepareRuleDataDocumentsFromSnapshot] masterEntityIds:", masterEntityIds);

        // Deleted Docs = this.localEntityIds - masterEntityIds
        const localDeletedEntityIds = Array.from(this.localEntityIds).filter((id) => !masterEntityIds.has(id));
        localDeletedEntityIds.forEach((id) => {
            if (!masterEntityIds.has(id)) {
                console.log("[RDBReplication.prepareRuleDataDocumentsFromSnapshot] Deleted Doc id:", id);
                finalDocs.push({
                    id,
                    workspaceId: this.syncWorkspace._config.id,
                    type: SyncEntityType.RULE_DATA,
                    data: {} as RuleDataSyncEntity["data"],
                    _deleted: true,
                    createdAt: undefined,
                    updatedAt: Date.now(),
                    createdBy: undefined,
                    updatedBy: undefined,
                });
            }
        });
        console.log(
            "[RDBReplication.prepareRuleDataDocumentsFromSnapshot] localDeletedEntityIds:",
            localDeletedEntityIds
        );
        console.log("[RDBReplication.prepareRuleDataDocumentsFromSnapshot] finalDocs:", { snapshot, finalDocs });
        return finalDocs;
    }

    private prepareRuleMetadataDocumentsFromSnapshot(
        snapshot: Record<string, RuleMetadataRdbSchema>
    ): RuleMetadataSyncEntity[] {
        const finalDocs: RuleMetadataSyncEntity[] = [];
        Object.entries(snapshot).forEach(([id, data]: [string, RuleMetadataRdbSchema]) => {
            finalDocs.push(this.ruleMetadataRdbToRuleMetadataDoc(id, snapshot?.[id]));
        });

        console.log("[RDBReplication.prepareRuleMetadataDocumentsFromSnapshot]:", { snapshot, finalDocs });
        return finalDocs;
    }

    private ruleDataRdbToRuleDataDoc(id: string, data: RuleDataRdbSchema): RuleDataSyncEntity {
        return {
            id,
            workspaceId: this.syncWorkspace._config.id,
            type: SyncEntityType.RULE_DATA,
            data: data as RuleDataSyncEntity["data"],
            createdAt: data?.creationDate || data?.createdAt,
            updatedAt: data?.modificationDate || data?.updatedAt,
            createdBy: data?.createdBy || data?.createdBy,
            updatedBy: data?.lastModifiedBy || data?.updatedBy,
        };
    }

    private ruleMetadataRdbToRuleMetadataDoc(id: string, data?: RuleMetadataRdbSchema): RuleMetadataSyncEntity {
        return {
            id,
            workspaceId: this.syncWorkspace._config.id,
            type: SyncEntityType.RULE_METADATA,
            data: {
                status: data?.status || RecordStatus.INACTIVE,
                isFavourite: data?.isFavourite || false,
            } as RuleMetadataSyncEntity["data"],
            createdAt: data?.creationDate || data?.createdAt,
            updatedAt: data?.modificationDate || data?.updatedAt,
            createdBy: data?.createdBy || data?.createdBy,
            updatedBy: data?.lastModifiedBy || data?.updatedBy,
        };
    }
}

export default RDBReplication;
