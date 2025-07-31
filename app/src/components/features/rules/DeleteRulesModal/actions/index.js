//EXTERNALS
import Logger from "lib/logger";
import { getExecutionLogsId } from "../../../../../utils/rules/misc";
import { clientStorageService } from "services/clientStorageService";
import syncingHelper from "lib/syncing/helpers/syncingHelper";

export const deleteRulesFromStorage = async (appMode, rulesToDelete, callback) => {
  try {
    const executionLogsToDelete = rulesToDelete.map((ruleId) => getExecutionLogsId(ruleId));

    Logger.log("Removing from storage in deleteRulesFromStorage");
    await syncingHelper.removeRecords(rulesToDelete);
    Logger.log("Removing from storage in deleteRulesFromStorage");
    clientStorageService.removeStorageObjects(executionLogsToDelete);

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
