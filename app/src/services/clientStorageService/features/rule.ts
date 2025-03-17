import Logger from "lib/logger";
import { clientStorageService } from "..";

class ClientRuleStorageService {
  async saveRuleOrGroup(ruleOrGroup: any, options = {}) {
    Logger.log("[ClientRuleStorageService]", ruleOrGroup);
    const formattedObject = {
      [ruleOrGroup.id]: {
        ...ruleOrGroup,
        modificationDate: ruleOrGroup?.modificationDate,
      },
    };

    return clientStorageService.saveStorageObject(formattedObject);
  }

  async saveMultipleRulesOrGroups(array: any[], options = {}) {
    console.log("[ClientRuleStorageService]", "saveMultipleRulesOrGroups", array);
    const formattedObject: any = {};
    array.forEach((object) => {
      if (object && object.id) formattedObject[object.id] = object;
    });

    clientStorageService.saveStorageObject(formattedObject);
  }

  async deleteRuleOrGroup(ruleOrGroup: any, options = {}) {
    console.log("[ClientRuleStorageService] deleteRuleOrGroup", ruleOrGroup);
    clientStorageService.removeStorageObject(ruleOrGroup.id);
  }

  async deleteMultipleRulesOrGroups(array: any[], options = {}) {
    console.log("[ClientRuleStorageService] deleteMultipleRulesOrGroups", array);
    array.forEach((object) => {
      this.deleteRuleOrGroup(object);
    });
  }

  async resetRulesAndGroups() {
    return clientStorageService.getStorageSuperObject().then(async (superObject: Record<string, any>) => {
      console.log("[ClientRuleStorageService] resetRulesAndGroups", { superObject });
      await clientStorageService.clearStorage();

      const newSuperObject: Record<string, any> = {};
      for (let key in superObject) {
        if (superObject[key]?.objectType === "rule" || superObject[key]?.objectType === "group") {
          continue;
        }

        newSuperObject[key] = superObject[key];
      }

      console.log("[ClientRuleStorageService] resetRulesAndGroups", { newSuperObject });
      await clientStorageService.saveStorageObject(newSuperObject);
    });
  }

  getAllRulesAndGroups = async (): Promise<Record<string, any>> => {
    console.log("[ClientRuleStorageService] getAllRulesAndGroups");
    const superObject = await clientStorageService.getStorageSuperObject();
    const rulesSuperObject: Record<string, any> = {};

    if (!superObject) {
      return rulesSuperObject;
    }

    for (let key in superObject) {
      if (superObject[key]?.objectType === "rule" || superObject[key]?.objectType === "group") {
        rulesSuperObject[key] = superObject[key];
      }
    }

    console.log("[ClientRuleStorageService] getAllRulesAndGroups", { rulesSuperObject });
    return rulesSuperObject;
  };

  getRecordsByObjectType = async (objectType: string): Promise<any> => {
    console.log("[ClientRuleStorageService] getRecordsByObjectType", objectType);
    const superObject = await clientStorageService.getStorageSuperObject();
    const records: any[] = [];

    for (let key in superObject) {
      if (superObject[key]?.objectType === "rule" || superObject[key]?.objectType === "group") {
        records.push(superObject[key]);
      }
    }

    if (!objectType) {
      return records;
    }

    const filteredRecords = records.filter((record) => record.objectType === objectType);
    console.log("[ClientRuleStorageService] getRecordsByObjectType", { filteredRecords });
    return filteredRecords;
  };

  getRecordById = async (id: string): Promise<any> => {
    console.log("[ClientRuleStorageService] getRecordById", id);
    const record = await clientStorageService.getStorageObject(id);
    return record;
  };
}

const clientRuleStorageService = new ClientRuleStorageService();
export default clientRuleStorageService;
