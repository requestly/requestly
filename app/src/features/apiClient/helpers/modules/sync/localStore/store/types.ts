import { ApiClientRepositoryInterface } from "../../interfaces";

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

    setApisSyncStatus: (status: Status) => void;
    setEnvsSyncStatus: (status: Status) => void;

    resetSyncStatus: () => void;
    syncApis: (syncRepository: ApiClientRepositoryInterface) => Promise<void>;
    syncEnvs: (syncRepository: ApiClientRepositoryInterface) => Promise<void>;
    syncAll: (syncRepository: ApiClientRepositoryInterface) => Promise<void>;
  };
}
