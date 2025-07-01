import { EnvironmentData } from "backend/environment/types";
import { ApiClientRepositoryInterface } from "../../interfaces";
import { RQAPI } from "features/apiClient/types";

export namespace APIClientSyncService {
  export enum Status {
    PENDING_RECORDS = "PENDING_RECORDS",
    ERROR = "error",
    SYNCING = "syncing",
    SUCCESS = "success",
  }

  export type State = {
    apisSyncStatus: Status;
    envsSyncStatus: Status;

    updateSyncStatus: () => Promise<{ apisSyncStatus: APIClientSyncService.Status; envsSyncStatus: APIClientSyncService.Status; }>;

    syncApis: (syncRepository: ApiClientRepositoryInterface, recordsToSkip?: Set<string>) => Promise<{ success: true; data: RQAPI.Record[] } | {success: false, error: string}>;
    syncEnvs: (syncRepository: ApiClientRepositoryInterface, recordsToSkip?: Set<string>) => Promise<{ success: true; data: EnvironmentData[] } | {success: false, error: string}>;
    syncAll: (
      syncRepository: ApiClientRepositoryInterface,
      recordsToSkip?: Set<string>,
    ) => Promise<{
      records: RQAPI.Record[];
      environments: EnvironmentData[];
    }>;
  };
}
