import { EnvironmentData } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import Dexie, { UpdateSpec, EntityTable } from "dexie";

type ApiClientLocalStorageMetadata = { version: number };

export class ApiClientLocalStorage {
  private db: Dexie = null;
  private static instance: ApiClientLocalStorage = null;

  constructor(metadata: ApiClientLocalStorageMetadata) {
    if (ApiClientLocalStorage.instance) {
      return ApiClientLocalStorage.instance;
    }

    this.db = new Dexie("apiClientLocalStorageDB") as Dexie & {
      apis: EntityTable<RQAPI.Record, "id">; // indexed by id
      environments: EntityTable<EnvironmentData, "id">;
    };

    this.db.version(metadata.version).stores({
      apis: "id",
      environments: "id",
    });
  }

  public static getInstance(): ApiClientLocalStorage | null {
    return ApiClientLocalStorage.instance;
  }

  public async getApiRecord<T extends RQAPI.Record>(id: string) {
    return this.db.table<T>("apis").get(id);
  }

  public async getApiRecords<T extends RQAPI.Record>() {
    return this.db.table<T>("apis").toArray((records) => {
      return records.filter((record) => !record.deleted);
    });
  }

  public async updateApiRecord<T extends RQAPI.Record>(id: string, record: T) {
    return this.db.table<T>("apis").put(record, id);
  }

  public async createApiRecord<T extends RQAPI.Record>(record: T) {
    return this.db.table<T>("apis").add(record);
  }

  public async getEnvironments() {
    return this.db.table<EnvironmentData>("environments").toArray();
  }

  public async createBulkApiRecords<T extends RQAPI.Record>(records: T[]) {
    return this.db.table<T>("apis").bulkAdd(records);
  }

  public async updateApiRecords<T extends RQAPI.Record>(updates: Partial<T>[]) {
    return this.db.table<T>("apis").bulkUpdate(
      updates.map((update) => {
        return {
          key: update.id,
          changes: update as UpdateSpec<T>,
        };
      })
    );
  }

  async clearAllTables() {
    return this.db
      .transaction("readwrite", this.db.tables, async () => {
        await Promise.all(this.db.tables.map((table) => table.clear()));
      })
      .then(() => {
        console.log("All tables cleared successfully.");
      })
      .catch((error) => {
        console.error("Error clearing tables:", error);
      });
  }

  public async resetDb() {
    return this.clearAllTables();
  }
}
