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
}
