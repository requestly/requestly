import APP_CONSTANTS from "config/constants";
import { actions } from "store";
import { StorageService } from "init";
import { getExecutionLogsId } from "utils/rules/misc";
import Logger from "lib/logger";
const fileDownload = require("js-file-download");

const { RULES_LIST_TABLE_CONSTANTS } = APP_CONSTANTS;

export const deleteRule = async (
  appMode,
  dispatch,
  ruleId,
  isRulesListRefreshPending
) => {
  Logger.log("Removing from storage in deleteRule");
  await StorageService(appMode).removeRecord(ruleId);
  deleteRuleExecutionLog(appMode, ruleId);
  dispatch(
    actions.updateRefreshPendingStatus({
      type: "rules",
      newValue: !isRulesListRefreshPending,
    })
  );
};

const deleteRuleExecutionLog = (appMode, ruleId) => {
  Logger.log("Removing from storage in deleteRuleExecutionLog");
  return StorageService(appMode).removeRecord(getExecutionLogsId(ruleId));
};

export const exportRule = (rule, groupwiseRules) => {
  const contentToExport = [];
  contentToExport.push(rule);
  if (rule.groupId !== RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID) {
    const group =
      groupwiseRules[rule.groupId][RULES_LIST_TABLE_CONSTANTS.GROUP_DETAILS];
    group.children = [];
    contentToExport.push(group);
  }
  fileDownload(
    JSON.stringify(contentToExport, null, 2),
    "requestly_rules.json",
    "application/json"
  );
};
