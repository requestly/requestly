import PSMH from "config/PageScriptMessageHandler";
import { BaseStorageClient } from "./base";
import Logger from "lib/logger";

class ExtensionStorageClient extends BaseStorageClient {
  /** get */
  async getStorageObject(key: string): Promise<any> {
    Logger.log("[ExtensionStorageClient] getStorageObject", { key });
    return new Promise((resolve) => {
      PSMH.sendMessage({ action: "GET_STORAGE_OBJECT", key }, resolve);
    });
  }

  /** getAll */
  async getStorageSuperObject(): Promise<Record<string, any>> {
    Logger.log("[ExtensionStorageClient] getStorageSuperObject");
    return new Promise((resolve) => {
      PSMH.sendMessage({ action: "GET_STORAGE_SUPER_OBJECT" }, resolve);
    });
  }

  /** Save Multiple */
  async saveStorageObject(object: Record<string, any>): Promise<any> {
    Logger.log("[ExtensionStorageClient] saveStorageObject", { object });
    return new Promise((resolve) => {
      PSMH.sendMessage({ action: "SAVE_STORAGE_OBJECT", object }, resolve);
    });
  }

  /** Remove */
  async removeStorageObject(key: string): Promise<any> {
    Logger.log("[ExtensionStorageClient] removeStorageObject", { key });
    return new Promise((resolve) => {
      PSMH.sendMessage({ action: "REMOVE_STORAGE_OBJECT", key }, resolve);
    });
  }

  /** Remove Multiple */
  // the underlying implementation is same as removeStorageObject for extension
  // hence key=array to make it consistent
  // reference to chrome API which accepts (string | array)
  // https://developer.chrome.com/docs/extensions/reference/storage/#:~:text=Promise-,Removes,-one%20or%20more
  async removeStorageObjects(keys: string[]): Promise<any> {
    Logger.log("[ExtensionStorageClient] removeStorageObjects", { keys });
    return new Promise((resolve) => {
      PSMH.sendMessage({ action: "REMOVE_STORAGE_OBJECT", key: keys }, resolve);
    });
  }

  /** Reset */
  async clearStorage(): Promise<any> {
    Logger.log("[ExtensionStorageClient] clearStorage");
    return new Promise((resolve) => {
      PSMH.sendMessage({ action: "CLEAR_STORAGE" }, resolve);
    });
  }
}

// Required for Messaging to Work. Move to extension init
PSMH.init();

export default ExtensionStorageClient;
