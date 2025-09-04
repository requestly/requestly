import { SyncEntityType, syncTypeToEntityMap } from "@requestly/shared/types/syncEntities";
import SyncWorkspace from "../syncWorkspace";
import { RxReplicationState } from "rxdb/plugins/replication";
import { RxCollection } from "rxdb";

abstract class BaseReplication<T extends SyncEntityType> {
  syncWorkspace: SyncWorkspace;
  syncEntityType: T;
  replicationState!: RxReplicationState<any, any>;
  isInitialized: boolean = false;
  collection: RxCollection<syncTypeToEntityMap[T]>;

  constructor(syncWorkspace: SyncWorkspace, syncEntityType: T) {
    this.syncWorkspace = syncWorkspace;
    this.syncEntityType = syncEntityType;
    this.collection = this.syncWorkspace.collections?.[this.syncEntityType];
  }

  abstract init(): Promise<void>;

  abstract start(): Promise<void>;

  abstract stop(): Promise<void>;
}

export default BaseReplication;
