import isEmpty from "is-empty";
import { StorageService } from "../../../../../../init";
import Logger from "lib/logger";

export const deleteGroup = (appMode, groupId, groupwiseRulesToPopulate, forceDelete = false) => {
  if (forceDelete) {
    Logger.log("Removing from storage in deleteGroup");
    return StorageService(appMode).removeRecord(groupId);
  }

  if (!groupwiseRulesToPopulate[groupId]) {
    return Promise.reject("Invalid Group");
  }
  if (isEmpty(groupwiseRulesToPopulate[groupId]["group_rules"])) {
    Logger.log("Removing from storage in deleteGroup");
    return StorageService(appMode).removeRecord(groupId);
  } else {
    return Promise.resolve({ err: "ungroup-rules-first" });
  }
};
