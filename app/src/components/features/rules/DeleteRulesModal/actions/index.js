//EXTERNALS
import Logger from "lib/logger";
import { StorageService } from "../../../../../init";
import { getExecutionLogsId } from "../../../../../utils/rules/misc";
import { clientStorageService } from "services/clientStorageService";

export const deleteRulesFromStorage = async (appMode, rulesToDelete, callback) => {
  try {
    const executionLogsToDelete = rulesToDelete.map((ruleId) => getExecutionLogsId(ruleId));

    Logger.log("Removing from storage in deleteRulesFromStorage");
    await StorageService(appMode).removeRecords(rulesToDelete);
    Logger.log("Removing from storage in deleteRulesFromStorage");
    await clientStorageService.removeStorageObjects(executionLogsToDelete);

    return callback?.();
  } catch (e) {
    Logger.error(e);
    throw e;
  }
};

export const deleteGroupsFromStorage = async (appMode, groupIdsToDelete) => {
  Logger.log("Removing from storage in deleteGroupsFromStorage");
  return StorageService(appMode).removeRecords(groupIdsToDelete);
};
