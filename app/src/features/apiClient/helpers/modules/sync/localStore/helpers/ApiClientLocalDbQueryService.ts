import { UpdateSpec } from "dexie";
import { NativeError } from "errors/NativeError";
import { ErrorSeverity } from "errors/types";
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
    try {
      return await this.getTable().get(id);
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async getRecords() {
    try {
      return await this.getTable().toArray();
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async updateRecord(id: string, record: T) {
    try {
      return await this.getTable().update(id, record as UpdateSpec<T>);
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async createRecord(record: T) {
    try {
      return await this.getTable().add(record);
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async createBulkRecords(records: T[]) {
    try {
      return await this.getTable().bulkAdd(records);
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async updateRecords(updates: (Partial<T> & { id: string })[]) {
    try {
      return await this.getTable().bulkUpdate(
        updates.map((update) => {
          return {
            key: update.id,
            changes: update as UpdateSpec<T>,
          };
        })
      );
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async deleteRecord(id: string) {
    try {
      return await this.getTable().delete(id);
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async deleteRecords(ids: string[]) {
    try {
      return await this.getTable().bulkDelete(ids);
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async clearAllRecords() {
    try {
      return await this.getTable().clear();
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }

  async getIsAllCleared() {
    try {
      const count = await this.getTable().count();
      return count === 0;
    } catch (error: any) {
      const e = new Error(error.message);
      throw NativeError.fromError(e).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }
}
