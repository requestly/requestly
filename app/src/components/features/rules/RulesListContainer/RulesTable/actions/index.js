import isEmpty from "is-empty";
import Logger from "lib/logger";
import syncingHelper from "lib/syncing/helpers/syncingHelper";

export const deleteGroup = (appMode, groupId, groupwiseRulesToPopulate, forceDelete = false) => {
  if (forceDelete) {
    Logger.log("Removing from storage in deleteGroup");
    return syncingHelper.removeRecord(groupId);
  }

  if (!groupwiseRulesToPopulate[groupId]) {
    return Promise.reject("Invalid Group");
  }
  if (isEmpty(groupwiseRulesToPopulate[groupId]["group_rules"])) {
    Logger.log("Removing from storage in deleteGroup");
    return syncingHelper.removeRecord(groupId);
  } else {
    return Promise.resolve({ err: "ungroup-rules-first" });
  }
};
