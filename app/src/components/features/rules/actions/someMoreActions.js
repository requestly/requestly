//CONFIG
import APP_CONSTANTS from "config/constants";
//ACTION OBJECTS
import { actions } from "store";
//EXTERNALS
import { StorageService } from "init";
//UTILS
import { generateObjectId } from "utils/FormattingHelper";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { getExecutionLogsId } from "utils/rules/misc";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import Logger from "lib/logger";
//DOWNLOAD.JS
const fileDownload = require("js-file-download");
//CONSTANTS
const { RULES_LIST_TABLE_CONSTANTS } = APP_CONSTANTS;

export const deleteRule = async (
  appMode,
  dispatch,
  ruleId,
  isRulesListRefreshPending
) => {
  Logger.log("Removing from storage in deleteRule");
  await StorageService(appMode).removeRecord(ruleId);
  deleteRuleMetaData(appMode, ruleId);
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

const deleteRuleMetaData = (appMode, ruleId) => {
  deleteRuleExecutionLog(appMode, ruleId);
};

export const copyRule = async (appMode, rule, navigate, callback) => {
  const newRule = {
    ...rule,
    creationDate: generateObjectCreationDate(),
    name: rule.name + " Copy",
    id: rule.ruleType + "_" + generateObjectId(),
    isSample: false,
    isFavourite: false,
    status: "Inactive",
  };
  Logger.log("Writing storage in copyRule");

  await StorageService(appMode).saveRuleOrGroup(newRule);
  redirectToRuleEditor(navigate, newRule.id);
  callback?.();
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
