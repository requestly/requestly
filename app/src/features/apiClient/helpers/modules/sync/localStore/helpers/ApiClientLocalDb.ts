import { EnvironmentData } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import Dexie, { UpdateSpec, EntityTable } from "dexie";
import { ApiClientLocalDbTable } from "./types";
import { ApiClientLocalStoreMeta } from "../../interfaces";

class ApiClientLocalDb {
  db: Dexie = null;

  constructor(metadata: ApiClientLocalStoreMeta) {
    console.log("Initializing ApiClientLocalDb with metadata:", metadata);
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

class ApiClientLocalDbProvider {
  private cache: ApiClientLocalDb = null;

  get(metadata: ApiClientLocalStoreMeta) {
    if (!this.cache) {
      this.cache = new ApiClientLocalDb(metadata);
    }
    return this.cache as ApiClientLocalDb;
  }
}

const dbProvider = new ApiClientLocalDbProvider();

export class ApiClientLocalDbQueryService<T> {
  private dbInstance: ApiClientLocalDb = null;

  constructor(meta: ApiClientLocalStoreMeta, readonly tableName: ApiClientLocalDbTable) {
    this.tableName = tableName;
    this.dbInstance = dbProvider.get(meta);
  }

  private getTable() {
    return this.dbInstance.db.table<T>(this.tableName);
  }

  async getRecord(id: string) {
    return this.getTable().get(id);
  }

  async getRecords() {
    return this.getTable().toArray();
  }

  async updateRecord(id: string, record: T) {
    return this.getTable().update(id, record as UpdateSpec<T>);
  }

  async createRecord(record: T) {
    return this.getTable().add(record);
  }

  async createBulkRecords(records: T[]) {
    return this.getTable().bulkAdd(records);
  }

  async updateRecords(updates: (Partial<T> & { id: string })[]) {
    return this.getTable().bulkUpdate(
      updates.map((update) => {
        return {
          key: update.id,
          changes: update as UpdateSpec<T>,
        };
      })
    );
  }

  async deleteRecord(id: string) {
    return this.getTable().delete(id);
  }

  async clearAllRecords() {
    return this.getTable().clear();
  }
}
