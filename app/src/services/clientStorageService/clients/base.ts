import Logger from "lib/logger";

export class BaseStorageClient {
  /** get */
  async getStorageObject(key: string): Promise<any> {
    Logger.log("No Storage Client Found");
    return;
  }

  /** getAll */
  async getStorageSuperObject(): Promise<Record<string, any> | undefined> {
    Logger.log("No Storage Client Found");
    return;
  }

  /** Save Multiple */
  async saveStorageObject(object: Record<string, any>) {
    Logger.log("No Storage Client Found");
    return;
  }

  /** Remove */
  async removeStorageObject(key: string) {
    Logger.log("No Storage Client Found");
    return;
  }

  /** Remove Multiple */
  async removeStorageObjects(key: string[]): Promise<any> {
    Logger.log("No Storage Client Found");
    return;
  }

  /** Reset */
  async clearStorage() {
    Logger.log("No Storage Client Found");
    return;
  }
}
