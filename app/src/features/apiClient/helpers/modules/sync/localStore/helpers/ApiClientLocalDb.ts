import { EnvironmentData } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import Dexie, { EntityTable } from "dexie";
import { ApiClientLocalDbTable } from "./types";
import { ApiClientLocalStoreMeta } from "../../interfaces";

export class ApiClientLocalDb {
  db: Dexie;

  constructor(metadata: ApiClientLocalStoreMeta) {
    this.db = new Dexie("apiClientLocalStorageDB") as Dexie & {
      [ApiClientLocalDbTable.APIS]: EntityTable<RQAPI.Record, "id">; // indexed by id
      [ApiClientLocalDbTable.ENVIRONMENTS]: EntityTable<EnvironmentData, "id">;
    };

    this.db.version(metadata.version).stores({
      [ApiClientLocalDbTable.APIS]: "id",
      [ApiClientLocalDbTable.ENVIRONMENTS]: "id",
    });
  }
}

export class ApiClientLocalDbAdapterProvider {
  private cache: ApiClientLocalDb<unknown> = null;

  get<T>(metadata: ApiClientLocalDbMetadata) {
    if (!this.cache) {
      this.cache = new ApiClientLocalDb<T>(metadata);
    }
    return this.cache as ApiClientLocalDb<T>;
  }
}

const apiClientLocalDbAdapterProvider = new ApiClientLocalDbAdapterProvider();
export default apiClientLocalDbAdapterProvider;
