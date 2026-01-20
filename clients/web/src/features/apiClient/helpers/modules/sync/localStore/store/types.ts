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

  export type SyncTask = null | Promise<
    | {
        success: true;
        data: {
          records: RQAPI.ApiClientRecord[];
          environments: EnvironmentData[];
        };
      }
    | {
        success: false;
        message: string;
      }
  >;

  export type State = {
    apisSyncStatus: Status;
    envsSyncStatus: Status;

    syncTask: SyncTask;
    setSyncTask(task: SyncTask): void;

    updateSyncStatus: () => Promise<{
      apisSyncStatus: APIClientSyncService.Status;
      envsSyncStatus: APIClientSyncService.Status;
    }>;

    syncApis: (
      syncRepository: ApiClientRepositoryInterface,
      recordsToSkip?: Set<string>
    ) => Promise<{ success: true; data: RQAPI.ApiClientRecord[] } | { success: false; error: string }>;
    syncEnvs: (
      syncRepository: ApiClientRepositoryInterface,
      recordsToSkip?: Set<string>
    ) => Promise<{ success: true; data: EnvironmentData[] } | { success: false; error: string }>;
    syncAll: (
      syncRepository: ApiClientRepositoryInterface,
      skip?: {
        recordsToSkip: Set<string>;
        environmentsToSkip: Set<string>;
      }
    ) => Promise<{
      records: RQAPI.ApiClientRecord[];
      environments: EnvironmentData[];
    }>;

    syncGlobalEnv(syncRepository: ApiClientRepositoryInterface): Promise<void>;
  };
}
