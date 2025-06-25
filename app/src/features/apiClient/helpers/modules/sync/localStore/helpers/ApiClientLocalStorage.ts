import { EnvironmentData } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import Dexie, { UpdateSpec, EntityTable } from "dexie";

type ApiClientLocalStorageMetadata = { version: number };

enum Table {
  APIS = "apis",
  ENVIRONMENTS = "environments",
}

export class ApiClientLocalStorage {
  private db: Dexie = null;
  private static instance: ApiClientLocalStorage = null;

  constructor(metadata: ApiClientLocalStorageMetadata) {
    if (ApiClientLocalStorage.instance) {
      return ApiClientLocalStorage.instance;
    }

    this.db = new Dexie("apiClientLocalStorageDB") as Dexie & {
      [Table.APIS]: EntityTable<RQAPI.Record, "id">; // indexed by id
      [Table.ENVIRONMENTS]: EntityTable<EnvironmentData, "id">;
    };

    this.db.version(metadata.version).stores({
      [Table.APIS]: "id",
      [Table.ENVIRONMENTS]: "id",
    });

    ApiClientLocalStorage.instance = this;
  }

  // apis
  public async getApiRecord<T extends RQAPI.Record>(id: string) {
    return this.db.table<T>(Table.APIS).get(id);
  }

  public async getApiRecords<T extends RQAPI.Record>() {
    return this.db.table<T>(Table.APIS).toArray((records) => {
      return records.filter((record) => !record.deleted);
    });
  }

  public async updateApiRecord<T extends RQAPI.Record>(id: string, record: T) {
    return this.db.table<T>(Table.APIS).update(id, record as UpdateSpec<T>);
  }

  public async createApiRecord<T extends RQAPI.Record>(record: T) {
    return this.db.table<T>(Table.APIS).add(record);
  }

  public async createBulkApiRecords<T extends RQAPI.Record>(records: T[]) {
    return this.db.table<T>(Table.APIS).bulkAdd(records);
  }

  public async updateApiRecords<T extends RQAPI.Record>(updates: Partial<T>[]) {
    return this.db.table<T>(Table.APIS).bulkUpdate(
      updates.map((update) => {
        return {
          key: update.id,
          changes: update as UpdateSpec<T>,
        };
      })
    );
  }

  async clearApiRecords() {
    return this.db.table(Table.APIS).clear();
  }

  // environments
  public async getEnvironments<T extends EnvironmentData>() {
    return this.db.table<T>(Table.ENVIRONMENTS).toArray();
  }

  public async getEnvironment<T extends EnvironmentData>(id: string) {
    return this.db.table<T>(Table.ENVIRONMENTS).get(id);
  }

  public async createEnvironment<T extends EnvironmentData>(record: T) {
    return this.db.table<T>(Table.ENVIRONMENTS).add(record);
  }

  public async createBulkEnvironments<T extends EnvironmentData>(records: T[]) {
    return this.db.table<T>(Table.ENVIRONMENTS).bulkAdd(records);
  }

  public async updateEnvironment<T extends EnvironmentData>(id: string, record: T) {
    return this.db.table<T>(Table.ENVIRONMENTS).update(id, record as UpdateSpec<T>);
  }

  public async deleteEnvironment<T extends EnvironmentData>(id: string) {
    return this.db.table<T>(Table.ENVIRONMENTS).delete(id);
  }

  async clearEnvironments() {
    return this.db.table(Table.ENVIRONMENTS).clear();
  }
}
