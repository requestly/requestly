import Logger from "lib/logger";

export class BaseStorageClient {
  /** get */
  async getStorageObject(key: string): Promise<any> {
    Logger.log("No Storage Client Found");
  }

  /** getAll */
  async getStorageSuperObject(): Promise<Record<string, any> | void> {
    Logger.log("No Storage Client Found");
  }

  /** Save Multiple */
  async saveStorageObject(object: Record<string, any>) {
    Logger.log("No Storage Client Found");
  }

  /** Remove */
  async removeStorageObject(key: string) {
    Logger.log("No Storage Client Found");
  }

  /** Remove Multiple */
  async removeStorageObjects(key: string[]): Promise<any> {
    Logger.log("No Storage Client Found");
  }

  /** Reset */
  async clearStorage() {
    Logger.log("No Storage Client Found");
  }
}
