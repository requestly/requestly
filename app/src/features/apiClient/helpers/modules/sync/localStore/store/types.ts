import { EnvironmentData } from "backend/environment/types";
import { ApiClientRepositoryInterface } from "../../interfaces";
import { ApiClientLocalStoreRepository } from "../ApiClientLocalStorageRepository";
import { RQAPI } from "features/apiClient/types";

export namespace APIClientSyncService {
  export enum Status {
    IDLE = "idle",
    ERROR = "error",
    SYNCING = "syncing",
    SUCCESS = "success",
  }

  export type State = {
    apisSyncStatus: Status;
    envsSyncStatus: Status;

    resetSyncStatus: () => void;
    getSyncStatus: () => Promise<Status[]>;
    getEntitySyncStatus: (
      respository:
        | ApiClientLocalStoreRepository["apiClientRecordsRepository"]
        | ApiClientLocalStoreRepository["environmentVariablesRepository"]
    ) => Promise<Status>;

    syncApis: (syncRepository: ApiClientRepositoryInterface) => Promise<{ success: boolean; data: RQAPI.Record[] }>;
    syncEnvs: (syncRepository: ApiClientRepositoryInterface) => Promise<{ success: boolean; data: EnvironmentData[] }>;
    syncAll: (
      syncRepository: ApiClientRepositoryInterface
    ) => Promise<{
      success: boolean;
      data: {
        records: RQAPI.Record[];
        environments: EnvironmentData[];
      };
    }>;
  };
}
