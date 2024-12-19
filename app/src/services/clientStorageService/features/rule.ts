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
}

const clientRuleStorageService = new ClientRuleStorageService();
export default clientRuleStorageService;
