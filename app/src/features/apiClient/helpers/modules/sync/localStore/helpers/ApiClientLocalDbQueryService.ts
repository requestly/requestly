import { UpdateSpec } from "dexie";
import { ApiClientLocalStoreMeta } from "../../interfaces";
import { ApiClientLocalDb } from "./ApiClientLocalDb";
import dbProvider from "./ApiClientLocalDbProvider";
import { ApiClientLocalDbTable } from "./types";
import { withDexieErrorHandling } from "features/apiClient/helpers/dexieErrorHandler";

export class ApiClientLocalDbQueryService<T> {
  private dbInstance: ApiClientLocalDb;

  constructor(meta: ApiClientLocalStoreMeta, readonly tableName: ApiClientLocalDbTable) {
    this.tableName = tableName;
    this.dbInstance = dbProvider.get(meta);
  }

  private getTable() {
    return this.dbInstance.db.table<T>(this.tableName);
  }

  async getRecord(id: string) {
    return withDexieErrorHandling(() => this.getTable().get(id));
  }

  async getRecords() {
    return withDexieErrorHandling(() => this.getTable().toArray());
  }

  async updateRecord(id: string, record: T) {
    return withDexieErrorHandling(() => this.getTable().update(id, record as UpdateSpec<T>));
  }

  async createRecord(record: T) {
    return withDexieErrorHandling(() => this.getTable().add(record));
  }

  async createBulkRecords(records: T[]) {
    return withDexieErrorHandling(() => this.getTable().bulkAdd(records));
  }

  async updateRecords(updates: (Partial<T> & { id: string })[]) {
    return withDexieErrorHandling(() =>
      this.getTable().bulkUpdate(
        updates.map((update) => {
          return {
            key: update.id,
            changes: update as UpdateSpec<T>,
          };
        })
      )
    );
  }

  async deleteRecord(id: string) {
    return withDexieErrorHandling(() => this.getTable().delete(id));
  }

  async deleteRecords(ids: string[]) {
    return withDexieErrorHandling(() => this.getTable().bulkDelete(ids));
  }

  async clearAllRecords() {
    return withDexieErrorHandling(() => this.getTable().clear());
  }

  async getIsAllCleared() {
    const count = await withDexieErrorHandling(() => this.getTable().count());
    return count === 0;
  }
}
