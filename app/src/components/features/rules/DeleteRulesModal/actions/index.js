//EXTERNALS
import Logger from "lib/logger";
import { getExecutionLogsId } from "../../../../../utils/rules/misc";
import syncingHelper from "lib/syncing/helpers/syncingHelper";
import clientRuleStorageService from "services/clientStorageService/features/rule";

export const deleteRulesFromStorage = async (appMode, rulesToDelete, callback) => {
  try {
    const executionLogsToDelete = rulesToDelete.map((ruleId) => getExecutionLogsId(ruleId));

    Logger.log("Removing from storage in deleteRulesFromStorage");
    await syncingHelper.removeRecords(rulesToDelete);
    Logger.log("Removing from storage in deleteRulesFromStorage");
    await clientRuleStorageService.deleteMultipleRulesOrGroups(executionLogsToDelete);

    return callback?.();
  } catch (e) {
    Logger.error(e);
    throw e;
  }
};

export const deleteGroupsFromStorage = async (appMode, groupIdsToDelete) => {
  Logger.log("Removing from storage in deleteGroupsFromStorage");
  return syncingHelper.removeRecords(groupIdsToDelete);
};
