import { UpdateSpec } from "dexie";
import { NativeError } from "errors/NativeError";
import { ErrorSeverity } from "errors/types";
import { ApiClientLocalStoreMeta } from "../../interfaces";
import { ApiClientLocalDb } from "./ApiClientLocalDb";
import dbProvider from "./ApiClientLocalDbProvider";
import { ApiClientLocalDbTable } from "./types";
import { MultipleInstanceError } from "features/apiClient/errors/MultipleInstanceError/MultipleInstanceError";

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
    try {
      return await this.getTable().get(id);
    } catch (error: any) {
      if (error.name === "DatabaseClosedError") {
        throw new MultipleInstanceError(
          "Multiple instances of Requestly are running. Please close other instances to continue.",
          "DatabaseClosedError"
        );
      }
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async getRecords() {
    return await this.getTable().toArray();
  }

  async updateRecord(id: string, record: T) {
    return await this.getTable().update(id, record as UpdateSpec<T>);
  }

  async createRecord(record: T) {
    return await this.getTable().add(record);
  }

  async createBulkRecords(records: T[]) {
    return await this.getTable().bulkAdd(records);
  }

  async updateRecords(updates: (Partial<T> & { id: string })[]) {
    return await this.getTable().bulkUpdate(
      updates.map((update) => {
        return {
          key: update.id,
          changes: update as UpdateSpec<T>,
        };
      })
    );
  }

  async deleteRecord(id: string) {
    return await this.getTable().delete(id);
  }

  async deleteRecords(ids: string[]) {
    return await this.getTable().bulkDelete(ids);
  }

  async clearAllRecords() {
    return await this.getTable().clear();
  }

  async getIsAllCleared() {
    const count = await this.getTable().count();
    return count === 0;
  }
}
