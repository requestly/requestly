import { EnvironmentData } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import Dexie, { EntityTable } from "dexie";
import { ApiClientLocalDbTable } from "./types";
import { ApiClientLocalStoreMeta } from "../../interfaces";
import { handleDexieError } from "features/apiClient/helpers/dexieErrorHandler";

export class ApiClientLocalDb {
  db: Dexie;

  constructor(metadata: ApiClientLocalStoreMeta) {
    try {
      this.db = new Dexie("apiClientLocalStorageDB") as Dexie & {
        [ApiClientLocalDbTable.APIS]: EntityTable<RQAPI.ApiClientRecord, "id">; // indexed by id
        [ApiClientLocalDbTable.ENVIRONMENTS]: EntityTable<EnvironmentData, "id">;
      };

      this.db.version(metadata.version).stores({
        [ApiClientLocalDbTable.APIS]: "id",
        [ApiClientLocalDbTable.ENVIRONMENTS]: "id",
      });
    } catch (error) {
      handleDexieError(error);
    }
  }
}
