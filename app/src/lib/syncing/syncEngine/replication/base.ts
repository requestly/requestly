import { SyncEntityType } from "@requestly/shared/types/syncEntities";
import SyncWorkspace from "../syncWorkspace";
import { RxReplicationState } from "rxdb/plugins/replication";

abstract class BaseReplication {
    syncWorkspace: SyncWorkspace;
    syncEntityType: SyncEntityType;
    replicationState!: RxReplicationState<unknown, unknown>;

    constructor(syncWorkspace: SyncWorkspace, syncEntityType: SyncEntityType) {
        this.syncWorkspace = syncWorkspace;
        this.syncEntityType = syncEntityType;
        // this.init();
    }

    abstract init(): Promise<void>;

    abstract start(): Promise<void>;

    abstract stop(): Promise<void>;
}

export default BaseReplication;
