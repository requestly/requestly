export abstract class BaseStorageClient {
  async saveStorageObject(object: Record<string, any>) {}
  async removeStorageObject(key: string) {}

  async getStorageSuperObject(): Promise<Record<string, any> | void> {}
  async clearStorage() {}
}
