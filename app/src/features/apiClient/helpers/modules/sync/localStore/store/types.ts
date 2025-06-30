import { ApiClientRepositoryInterface } from "../../interfaces";
import { ApiClientLocalStoreRepository } from "../ApiClientLocalStorageRepository";

export namespace APIClientSyncService {
  export enum Status {
    IDLE = "idle",
    ERROR = "error",
    SYNCING = "syncing",
    SUCCESS = "success",
  }

  export type State = {
    isSyncStatusLoading: boolean;
    apisSyncStatus: Status;
    envsSyncStatus: Status;

    resetSyncStatus: () => void;
    updateSyncStatus: () => Promise<void>;
    getEntitySyncStatus: (
      respository:
        | ApiClientLocalStoreRepository["apiClientRecordsRepository"]
        | ApiClientLocalStoreRepository["environmentVariablesRepository"]
    ) => Promise<Status>;
    syncApis: (syncRepository: ApiClientRepositoryInterface) => Promise<void>;
    syncEnvs: (syncRepository: ApiClientRepositoryInterface) => Promise<void>;
    syncAll: (syncRepository: ApiClientRepositoryInterface) => Promise<void>;
  };
}
