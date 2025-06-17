import { EnvironmentMap } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

export type ApiClientLocalStoreMeta = {
  version: number;
  storageKey: string;
};

export type LocalStoreSyncRecords = {
  apis: RQAPI.Record[];
  environments: EnvironmentMap;
};
