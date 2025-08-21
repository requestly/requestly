import SyncWorkspace from "./syncWorkspace";
import { SyncModel } from "./models";
import { SyncEntityType, syncTypeToEntityMap } from "@requestly/shared/types/syncEntities";
import { SyncEntity } from "@requestly/shared/types/syncEntities";
import { RxDocument } from "rxdb";
import { Subscription } from "rxjs";
import { Workspace } from "features/workspaces/types";

class SyncEngine {
    syncWorkspacesMap: {
        [workspaceId: string]: SyncWorkspace;
    } = {};
    initInProgress: boolean = false;
    initialized: boolean = false;
    authToken?: string = undefined;
    userId?: string = undefined;

    async init(workspaces: Workspace[], userId?: string, authToken?: string) {
        if (this.initInProgress) {
            return;
        }
        this.initInProgress = true;
        this.authToken = authToken;
        this.userId = userId;

        console.log("[SyncEngine.init] Start", { workspaces, authToken });
        await Promise.all(
            workspaces.map(async (workspace: Workspace) => {
                if (this.syncWorkspacesMap[workspace.id]) {
                    console.log("[SyncEngine.init] Workspace Already Init", { workspaceId: workspace.id });
                    return;
                }
                await this.initWorkspace(workspace);
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

    async initWorkspace(workspace: Workspace) {
        this.syncWorkspacesMap[workspace.id] = await SyncWorkspace.create(workspace, this.userId, this.authToken);
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
                    callback(syncEntities, syncWorkspace._data.id);
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
            const updatedDataDoc = await syncWorkspace.collections[syncModel.entity.type]?.upsert(
                syncModel.entity as any
            );
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
