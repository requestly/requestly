import { BaseStorageClient } from "./base";

class DesktopStorageClient extends BaseStorageClient {
  /** get */
  async getStorageObject(key: string) {}

  /** getAll */
  async getStorageSuperObject(): Promise<Record<string, any> | void> {}

  /** Save Multiple */
  async saveStorageObject(object: Record<string, any>) {}

  /** Remove */
  async removeStorageObject(key: string) {}

  /** Remove Multiple */
  async removeStorageObjects(key: string[]): Promise<any> {}

  /** Reset */
  async clearStorage() {}
}

export default DesktopStorageClient;
