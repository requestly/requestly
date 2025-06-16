import { EnvironmentMap } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

export type LocalStorageSyncRecords = {
  apis: RQAPI.Record[];
  environments: EnvironmentMap;
};
