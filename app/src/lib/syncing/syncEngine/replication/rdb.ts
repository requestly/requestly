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

class RDBReplication extends BaseReplication {
    async init() {
        const collection = this.syncWorkspace.collections?.[this.syncEntityType];
        const replicationIdentifier = `${this.syncWorkspace._data.id}-${this.syncEntityType}-replication`;

        // @ts-ignore
        this.replicationState = replicateRxCollection({
            autoStart: false,
            collection,
            replicationIdentifier,
            push: {
                handler: this.pushHandler(),
            },
            pull: {
                handler: this.pullHandler(),
                stream$: this.pullStreamListener(),
            },
        });
    }

    async start(): Promise<void> {
        this.replicationState.start();
        return;
    }

    async stop(): Promise<void> {
        this.replicationState.cancel();
        return;
    }

    // #region - RDB specific code

    // #region - Push
    private pushHandler = (): ReplicationPushHandler<syncTypeToEntityMap[typeof this.syncEntityType]> => {
        switch (this.syncEntityType) {
            case SyncEntityType.RULE_DATA:
                return this.pushRuleDataHandler;
            case SyncEntityType.RULE_METADATA:
                return this.pushRuleMetadataHandler;
            default:
                throw Error(`Invalid SyncEntityType  ${this.syncEntityType}`);
        }
    };

    private pushRuleDataHandler: ReplicationPushHandler<RuleDataSyncEntity> = async (changedRows) => {
        const finalUpdates: Record<string, Object> = {};
        changedRows.forEach((changedRow) => {
            finalUpdates[changedRow.newDocumentState.id] = {
                ...changedRow.newDocumentState.data,
            };
        });

        console.log("[`RDBReplication`.pushRuleDataHandler] Final updates:", finalUpdates);

        const promises = Object.entries(finalUpdates).map(([id, finalUpdate]) => {
            const updateRef = ref(db, `${this.getRuleDataPath()}/${id}`);
            return update(updateRef, finalUpdate);
        });

        await Promise.allSettled(promises)
            .then((results) => {
                console.log("[RDBReplication.pushRuleDataHandler] Push results:", results);
            })
            .catch((error) => {
                console.error("[RDBReplication.pushRuleDataHandler] Error pushing rule data:", error);
            });

        return []; // TODO: Return if any conflicts or errors
    };

    private pushRuleMetadataHandler: ReplicationPushHandler<RuleMetadataSyncEntity> = async (changedRows) => {
        const finalUpdates: Record<string, Object> = {};
        changedRows.forEach((changedRow) => {
            finalUpdates[changedRow.newDocumentState.id] = {
                ...changedRow.newDocumentState.data,
            };
        });

        console.log("[RDBReplication.pushRuleMetadataHandler] Final updates:", finalUpdates);

        const promises = Object.entries(finalUpdates).map(([id, finalUpdate]) => {
            const updateRef = ref(db, `${this.getRuleMetadataPath()}/${id}`);
            return update(updateRef, finalUpdate);
        });

        await Promise.allSettled(promises)
            .then((results) => {
                console.log("[RDBReplication.pushRuleDataHandler] Push results:", results);
            })
            .catch((error) => {
                console.error("[RDBReplication.pushRuleDataHandler] Error pushing rule data:", error);
            });

        return []; // TODO: Return if any conflicts or errors
    };

    // #endregion

    // #region - Pull
    private pullHandler(): ReplicationPullHandler<syncTypeToEntityMap[typeof this.syncEntityType], number> {
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

        const rulesData = await get(ruleDataRef).then((snaphot) => {
            if (snaphot.exists()) {
                return snaphot.val();
            }

            return {};
        });

        const documents: RuleDataSyncEntity[] = Object.entries(rulesData).map(([id, data]) => {
            return {
                id,
                workspaceId: this.syncWorkspace._data.id,
                type: SyncEntityType.RULE_DATA,
                data: data as RuleDataSyncEntity["data"],
                // @ts-ignore
                createdAt: data?.creationDate,
                // @ts-ignore
                updatedAt: data?.modificationDate,
                // @ts-ignore
                createdBy: data?.createdBy,
                // @ts-ignore
                updatedBy: data?.lastModifiedBy,
                _deleted: false,
            };
        });

        console.log("[RDBReplication.pullRuleDataHandler] Fetched documents:", documents);

        return {
            documents,
            checkpoint: null,
        };
    };

    // @ts-ignore
    private pullRuleMetadataHandler: ReplicationPullHandler<RuleMetadataSyncEntity, number> = async () => {
        const ruleDataRef = ref(db, this.getRuleMetadataPath());

        const rulesData = await get(ruleDataRef).then((snaphot) => {
            if (snaphot.exists()) {
                return snaphot.val();
            }

            return {};
        });

        const documents: RuleMetadataSyncEntity[] = Object.entries(rulesData).map(([id, data]) => {
            return {
                id,
                workspaceId: this.syncWorkspace._data.id,
                type: SyncEntityType.RULE_METADATA,
                data: {
                    // @ts-ignore
                    status: data?.status,
                    // @ts-ignore
                    isFavourite: data?.isFavourite,
                } as RuleMetadataSyncEntity["data"],
                // @ts-ignore
                createdAt: data?.creationDate,
                // @ts-ignore
                updatedAt: data?.modificationDate,
                // @ts-ignore
                createdBy: data?.createdBy,
                // @ts-ignore
                updatedBy: data?.lastModifiedBy,
            };
        });

        console.log("[RDBReplication.pullRuleMetadataHandler] Fetched documents:", documents);

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

            const documents: RuleDataSyncEntity[] = Object.entries(rulesData).map(([id, data]) => {
                return {
                    id,
                    workspaceId: this.syncWorkspace._data.id,
                    type: SyncEntityType.RULE_DATA,
                    data: data as RuleDataSyncEntity["data"],
                    // @ts-ignore
                    createdAt: data?.creationDate,
                    // @ts-ignore
                    updatedAt: data?.modificationDate,
                    // @ts-ignore
                    createdBy: data?.createdBy,
                    // @ts-ignore
                    updatedBy: data?.lastModifiedBy,
                    _deleted: false,
                };
            });

            console.log("[RDBReplication.pullStreamListener RuleData] Fetched documents:", documents);
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
            let rulesData = {};
            if (snapshot.exists()) {
                rulesData = snapshot.val();
            }

            const documents: RuleMetadataSyncEntity[] = Object.entries(rulesData).map(([id, data]) => {
                return {
                    id,
                    workspaceId: this.syncWorkspace._data.id,
                    type: SyncEntityType.RULE_METADATA,
                    data: {
                        // @ts-ignore
                        status: data?.status,
                        // @ts-ignore
                        isFavourite: data?.isFavourite,
                    } as RuleMetadataSyncEntity["data"],
                    // @ts-ignore
                    createdAt: data?.creationDate,
                    // @ts-ignore
                    updatedAt: data?.modificationDate,
                    // @ts-ignore
                    createdBy: data?.createdBy,
                    // @ts-ignore
                    updatedBy: data?.lastModifiedBy,
                };
            });

            console.log("[RDBReplication.pullStreamListener RuleMetadata] Fetched documents:", documents);

            subject.next({
                documents,
                checkpoint: null, // TODO Placeholder for checkpoint, can be updated based on your logic
            });
        });

        return subject.asObservable();
    }
    // #endregion

    // # endregion

    private getRuleDataPath(): string {
        let refPath = null;
        if (this.syncWorkspace._data.workspaceType === WorkspaceType.PERSONAL) {
            refPath = `sync/${this.syncWorkspace.userId}/records`;
        } else if (this.syncWorkspace._data.workspaceType === WorkspaceType.SHARED) {
            refPath = `teamSync/${this.syncWorkspace._data.id}/records`;
        } else {
            throw new Error("Invalid workspace type for Rule Data reference");
        }

        return refPath;
    }

    private getRuleMetadataPath(): string {
        let refPath = null;
        if (this.syncWorkspace._data.workspaceType === WorkspaceType.PERSONAL) {
            refPath = `sync/${this.syncWorkspace.userId}/records`;
        } else if (this.syncWorkspace._data.workspaceType === WorkspaceType.SHARED) {
            // TODO: Global Sync pending
            // teamSync/<teamId>/records/<recordId>/status
            // teamSync/<teamId>/records/<recordId>/isFavourite
            refPath = `teamSync/${this.syncWorkspace._data.id}/userConfig/${this.syncWorkspace.userId}/rulesConfig`;
        } else {
            throw new Error("Invalid workspace type for Rule Metadata reference");
        }

        return refPath;
    }
}

export default RDBReplication;
