import { getStorageHelper } from "engines";
import { BaseStorageClient } from "./clients/base";

export const LocalStorageService = (appMode: string) => {
  return new LocalStorageServiceWrapper(appMode);
};

class LocalStorageServiceWrapper {
  appMode: string;
  storageClient: BaseStorageClient;

  constructor(appMode: string) {
    this.appMode = appMode;
    this.storageClient = getStorageHelper(appMode);
  }

  async saveRuleOrGroup(ruleOrGroup: any, options = {}) {
    console.log("[LocalStorageServiceWrapper][debug]", "saveRuleOrGroup", ruleOrGroup);
    const formattedObject = {
      [ruleOrGroup.id]: {
        ...ruleOrGroup,
        modificationDate: ruleOrGroup?.modificationDate,
      },
    };

    this.storageClient.saveStorageObject(formattedObject);
  }

  async saveMultipleRulesOrGroups(array: any[], options = {}) {
    console.log("[LocalStorageServiceWrapper][debug]", "saveMultipleRulesOrGroups", array);
    const formattedObject: any = {};
    array.forEach((object) => {
      if (object && object.id) formattedObject[object.id] = object;
    });

    this.storageClient.saveStorageObject(formattedObject);
  }

  async deleteRuleOrGroup(ruleOrGroup: any, options = {}) {
    console.log("[LocalStorageServiceWrapper][debug]", "deleteRuleOrGroup", ruleOrGroup);
    this.storageClient.removeStorageObject(ruleOrGroup.id);
  }

  async deleteMultipleRulesOrGroups(array: any[], options = {}) {
    console.log("[LocalStorageServiceWrapper][debug]", "deleteMultipleRulesOrGroups", array);
    array.forEach((object) => {
      this.deleteRuleOrGroup(object);
    });
  }

  async clearStorage() {
    await this.storageClient.clearStorage();
  }

  async resetRulesAndGroups() {
    return this.storageClient.getStorageSuperObject().then(async (superObject: Record<string, any>) => {
      console.log("[LocalStorageServiceWrapper][debug]", "resetRulesAndGroups", { superObject });
      await this.clearStorage();

      const newSuperObject: Record<string, any> = {};
      for (let key in superObject) {
        if (superObject[key]?.objectType === "rule" || superObject[key]?.objectType === "group") {
          continue;
        }

        newSuperObject[key] = superObject[key];
      }

      console.log("[LocalStorageServiceWrapper][debug]", "resetRulesAndGroups", { newSuperObject });
      await this.storageClient.saveStorageObject(newSuperObject);
    });
  }
}
