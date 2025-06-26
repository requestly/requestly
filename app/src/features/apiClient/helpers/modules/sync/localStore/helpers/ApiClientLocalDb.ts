import { EnvironmentData } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import Dexie, { UpdateSpec, EntityTable } from "dexie";
import { ApiClientLocalDbMetadata, ApiClientLocalDbTable } from "./types";

class ApiClientLocalDb<T> {
  private db: Dexie = null;

  constructor(metadata: ApiClientLocalDbMetadata) {
    this.db = new Dexie("apiClientLocalStorageDB") as Dexie & {
      [ApiClientLocalDbTable.APIS]: EntityTable<RQAPI.Record, "id">; // indexed by id
      [ApiClientLocalDbTable.ENVIRONMENTS]: EntityTable<EnvironmentData, "id">;
    };

    this.db.version(metadata.version).stores({
      [ApiClientLocalDbTable.APIS]: "id",
      [ApiClientLocalDbTable.ENVIRONMENTS]: "id",
    });
  }

  private getTable(tableName: ApiClientLocalDbTable) {
    return this.db.table<T>(tableName);
  }

  async getRecord(tableName: ApiClientLocalDbTable, id: string) {
    return this.getTable(tableName).get(id);
  }

  async getRecords(tableName: ApiClientLocalDbTable) {
    return this.getTable(tableName).toArray();
  }

  async updateRecord(tableName: ApiClientLocalDbTable, id: string, record: T) {
    return this.getTable(tableName).update(id, record as UpdateSpec<T>);
  }

  async createRecord(tableName: ApiClientLocalDbTable, record: T) {
    return this.getTable(tableName).add(record);
  }

  async createBulkRecords(tableName: ApiClientLocalDbTable, records: T[]) {
    return this.getTable(tableName).bulkAdd(records);
  }

  async updateRecords(tableName: ApiClientLocalDbTable, updates: (Partial<T> & { id: string })[]) {
    return this.getTable(tableName).bulkUpdate(
      updates.map((update) => {
        return {
          key: update.id,
          changes: update as UpdateSpec<T>,
        };
      })
    );
  }

  async deleteRecord(tableName: ApiClientLocalDbTable, id: string) {
    return this.getTable(tableName).delete(id);
  }

  async clearAllRecords(tableName: ApiClientLocalDbTable) {
    return this.getTable(tableName).clear();
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
