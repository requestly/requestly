import { RuleStorageModel } from "../syncStorageService/models/rule";

class SyncingHelper {
  async saveRuleOrGroup(ruleOrGroup: any, options = {}) {
    const workspaceId = window.activeWorkspaceIds?.[0];
    console.log("[SyncingV2][debug]saveRuleOrGroup", { ruleOrGroup, workspaceId });
    return await RuleStorageModel.create(ruleOrGroup, workspaceId).save();
  }

  async saveMultipleRulesOrGroups(array: any, options = {}) {
    console.log("[SyncingV2][debug]saveMultipleRulesOrGroups");
    // TODO-Syncing: [P1] Support bulk updates to RuleStorageModel.
    const promises = array.map((ruleOrGroup: any) => {
      return this.saveRuleOrGroup(ruleOrGroup);
    });
    return Promise.all(promises);
  }

  async removeRecord(key: any) {
    try {
      console.log("[StorageServiceWrapper]removeRecord", { key });
      // TODO-syncing: Temporary fix to remove record from RuleStorageModel
      RuleStorageModel.create({ id: key }, window.activeWorkspaceIds?.[0]).delete();
      return Promise.resolve(true);
    } catch (error) {
      console.error("Error removing record:", error);
    }
  }

  async removeRecords(array: any) {
    try {
      console.log("[StorageServiceWrapper]removeRecords", { array });
      const promises = array?.map((key: any) => {
        return this.removeRecord(key);
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Error removing record:", error);
      throw error;
    }
  }
}

const syncingHelper = new SyncingHelper();
export default syncingHelper;
