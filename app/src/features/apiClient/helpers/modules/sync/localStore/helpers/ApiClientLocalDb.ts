import { EnvironmentData } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import Dexie, { EntityTable } from "dexie";
import { NativeError } from "errors/NativeError";
import { ErrorSeverity } from "errors/types";
import { ApiClientLocalDbTable } from "./types";
import { ApiClientLocalStoreMeta } from "../../interfaces";

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
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }
}
