import { UpdateSpec } from "dexie";
import { ApiClientLocalStoreMeta } from "../../interfaces";
import { ApiClientLocalDb } from "./ApiClientLocalDb";
import dbProvider from "./ApiClientLocalDbProvider";
import { ApiClientLocalDbTable } from "./types";

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

  async deleteRecords(ids: string[]) {
    return this.getTable().bulkDelete(ids);
  }

  async clearAllRecords() {
    return this.getTable().clear();
  }

  async getIsAllCleared() {
    const count = await this.getTable().count();
    return count === 0;
  }
}
