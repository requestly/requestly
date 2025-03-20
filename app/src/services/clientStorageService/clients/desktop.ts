import { isDesktopStorageServiceAvailable } from "actions/DesktopActions";
import { BaseStorageClient } from "./base";

class DesktopStorageClient extends BaseStorageClient {
  /** get */
  async getStorageObject(key: string) {
    return new Promise((resolve, reject) => {
      if (isDesktopStorageServiceAvailable()) {
        resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.getStorageObject(key));
      } else reject("Couldnt hit desktop API");
    });
  }

  /** getAll */
  async getStorageSuperObject(): Promise<Record<string, any> | undefined> {
    return new Promise((resolve, reject) => {
      if (isDesktopStorageServiceAvailable()) {
        resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.getStorageSuperObject());
      } else reject("Couldnt hit desktop API");
    });
  }

  /** Save Multiple */
  async saveStorageObject(object: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (isDesktopStorageServiceAvailable()) {
        resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.setStorageObject(object));
      } else reject("Couldnt hit desktop API");
    });
  }

  /** Remove */
  async removeStorageObject(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (isDesktopStorageServiceAvailable()) {
        resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.deleteItem(key));
      } else reject("Couldnt hit desktop API");
    });
  }

  /** Remove Multiple */
  async removeStorageObjects(keys: string[]): Promise<any> {
    if (!keys) {
      return new Error("Empty objects to remove list");
    }

    const removeStorageObjectPromises: Promise<any>[] = [];
    keys.forEach((key) => {
      removeStorageObjectPromises.push(this.removeStorageObject(key));
    });
    return Promise.all(removeStorageObjectPromises).catch((err) => err);
  }

  /** Reset */
  async clearStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (isDesktopStorageServiceAvailable()) {
        resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.clearStorage());
      } else reject("Couldnt hit desktop API");
    });
  }
}

export default DesktopStorageClient;
