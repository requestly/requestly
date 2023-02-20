//EXTERNALS
import Logger from "lib/logger";
import { StorageService } from "../../../../../init";
import { getExecutionLogsId } from "../../../../../utils/rules/misc";

export const deleteRulesFromStorage = async (
  appMode,
  rulesToDelete,
  callback
) => {
  try {
    const executionLogsToDelete = rulesToDelete.map((ruleId) =>
      getExecutionLogsId(ruleId)
    );

    await StorageService(appMode).removeRecords(rulesToDelete);
    await StorageService(appMode).removeRecordsWithoutSyncing(
      executionLogsToDelete
    );

    return callback();
  } catch (e) {
    Logger.error(e);
  }
};

export const deleteGroupsFromStorage = async (appMode, groupIdsToDelete) => {
  return StorageService(appMode).removeRecords(groupIdsToDelete);
};
