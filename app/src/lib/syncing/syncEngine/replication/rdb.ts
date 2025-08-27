import {
    RuleDataSyncEntity,
    RuleMetadataSyncEntity,
    SyncEntityType,
    syncTypeToEntityMap,
} from "@requestly/shared/types/syncEntities";
import BaseReplication from "./base";
import { replicateRxCollection } from "rxdb/plugins/replication";
import { WorkspaceType } from "features/workspaces/types";
import { ReplicationPullHandler, ReplicationPushHandler } from "rxdb";
import { get, getDatabase, ref, update, onValue } from "firebase/database";
import firebaseApp from "firebase";
import { Subject } from "rxjs";

const db = getDatabase(firebaseApp);

type RuleDataRdbSchema = RuleDataSyncEntity["data"] & {
    _deleted: boolean;
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
    _deleted: boolean;
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
            this.isInitialized = true;
        } else {
            throw new Error(`No collection for Replication entityType: ${this.syncEntityType}`);
        }
    }

    async start(): Promise<void> {
        if (this.isInitialized) {
            this.replicationState.start();
        } else {
            console.error(`RDBReplication not initialized for entityType: ${this.syncEntityType}`);
        }
    }

    async stop(): Promise<void> {
        if (this.isInitialized) {
            this.replicationState.cancel();
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
        const finalUpdates: Record<string, RuleDataSyncEntity["data"] & { _deleted: boolean }> = {};
        changedRows.forEach((changedRow) => {
            finalUpdates[changedRow.newDocumentState.id] = {
                ...changedRow.newDocumentState.data,
                _deleted: changedRow.newDocumentState._deleted,
            };
        });

        console.log("[`RDBReplication`.pushRuleDataHandler] Final updates:", finalUpdates);

        const updatedPromises = Object.entries(finalUpdates).map(([id, finalUpdate]) => {
            const updateRef = ref(db, `${this.getRuleDataPath()}/${id}`);
            return update(updateRef, finalUpdate);
        });

        // TODO-cleanup: Should this be allSettled?
        await Promise.allSettled(updatedPromises)
            .then((results) => {
                console.log("[RDBReplication.pushRuleDataHandler] Push results:", results);
            })
            .catch((error) => {
                console.error("[RDBReplication.pushRuleDataHandler] Error pushing rule data:", error);
            });

        return []; // TODO-cleanup: Return if any conflicts or errors
    };

    private pushRuleMetadataHandler: ReplicationPushHandler<RuleMetadataSyncEntity> = async (changedRows) => {
        const finalUpdates: Record<string, RuleMetadataRdbSchema> = {};
        changedRows.forEach((changedRow) => {
            finalUpdates[changedRow.newDocumentState.id] = {
                ...changedRow.newDocumentState.data,
                _deleted: changedRow.newDocumentState._deleted,
            };
        });

        console.log("[RDBReplication.pushRuleMetadataHandler] Final updates:", finalUpdates);

        const updatePromises = Object.entries(finalUpdates).map(([id, finalUpdate]) => {
            const updateRef = ref(db, `${this.getRuleMetadataPath()}/${id}`);
            return update(updateRef, finalUpdate);
        });

        // TODO-cleanup: Should this be allSettled?
        await Promise.allSettled(updatePromises)
            .then((results) => {
                console.log("[RDBReplication.pushRuleDataHandler] Push results:", results);
            })
            .catch((error) => {
                console.error("[RDBReplication.pushRuleDataHandler] Error pushing rule data:", error);
            });

        return []; // TODO-cleanup: Return if any conflicts or errors
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

        const documents: RuleDataSyncEntity[] = Object.entries(rulesData).map(([id, data]: [string, any]) => {
            return this.ruleDataSnapshotToRuleData(data, id);
        });

        console.log("[RDBReplication.pullRuleDataHandler] Fetched documents:", rulesData, documents);

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

        const documents: RuleMetadataSyncEntity[] = Object.entries(rulesMetadata).map(([id, data]: [string, any]) => {
            return this.ruleMetadataSnapshotToRuleMetadata(data, id);
        });

        console.log("[RDBReplication.pullRuleMetadataHandler] Fetched documents:", rulesMetadata, documents);

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

        onValue(ruleDataRef, (snapshot) => {
            let rulesData = {};
            if (snapshot.exists()) {
                rulesData = snapshot.val();
            }

            const documents: RuleDataSyncEntity[] = Object.entries(rulesData).map(([id, data]: [string, any]) => {
                return this.ruleDataSnapshotToRuleData(data, id);
            });

            console.log("[RDBReplication.pullStreamListener RuleData] Fetched documents:", rulesData, documents);
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

        onValue(ruleMetadataRef, (snapshot) => {
            let rulesMetadata = {};
            if (snapshot.exists()) {
                rulesMetadata = snapshot.val();
            }

            const documents: RuleMetadataSyncEntity[] = Object.entries(rulesMetadata).map(
                ([id, data]: [string, any]) => {
                    return this.ruleMetadataSnapshotToRuleMetadata(data, id);
                }
            );

            console.log(
                "[RDBReplication.pullStreamListener RuleMetadata] Fetched documents:",
                rulesMetadata,
                documents
            );

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

    private ruleDataSnapshotToRuleData(snapshot: RuleDataRdbSchema, id: string): RuleDataSyncEntity {
        return {
            id,
            workspaceId: this.syncWorkspace._config.id,
            type: SyncEntityType.RULE_DATA,
            data: snapshot as RuleDataSyncEntity["data"],
            _deleted: snapshot?._deleted || false,
            createdAt: snapshot?.creationDate || snapshot?.createdAt,
            updatedAt: snapshot?.modificationDate || snapshot?.updatedAt,
            createdBy: snapshot?.createdBy || snapshot?.createdBy,
            updatedBy: snapshot?.lastModifiedBy || snapshot?.updatedBy,
        };
    }

    private ruleMetadataSnapshotToRuleMetadata(snapshot: RuleMetadataRdbSchema, id: string): RuleMetadataSyncEntity {
        return {
            id,
            workspaceId: this.syncWorkspace._config.id,
            type: SyncEntityType.RULE_METADATA,
            data: {
                status: snapshot?.status,
                isFavourite: snapshot?.isFavourite,
            } as RuleMetadataSyncEntity["data"],
            _deleted: snapshot?._deleted || false,
            createdAt: snapshot?.creationDate || snapshot?.createdAt,
            updatedAt: snapshot?.modificationDate || snapshot?.updatedAt,
            createdBy: snapshot?.createdBy || snapshot?.createdBy,
            updatedBy: snapshot?.lastModifiedBy || snapshot?.updatedBy,
        };
    }
}

export default RDBReplication;
