import isEmpty from "is-empty";
//CONSTANTS
import APP_CONSTANTS from "config/constants";
//REDUCER ACTION OBJECTS
import { actions } from "store";
import { StorageService } from "../../../../../../init";
import Logger from "lib/logger";
//Utils

const { RULES_LIST_TABLE_CONSTANTS } = APP_CONSTANTS;

export const updateRulesListRefreshPendingStatus = (dispatch, isRulesListRefreshPending) => {
  dispatch(
    actions.updateRefreshPendingStatus({
      type: "rules",
      newValue: !isRulesListRefreshPending,
    })
  );
};

export const ungroupSelectedRules = (appMode, selectedRuleIds, user) => {
  const allPromises = [];

  return new Promise((resolve, reject) => {
    if (isEmpty(selectedRuleIds)) {
      reject(new Error("No Rules were Selected"));
    } else {
      Logger.log("Reading storage in RulesTable ungroupSelectedRules");
      StorageService(appMode)
        .getAllRecords()
        .then((allRules) => {
          selectedRuleIds.forEach(async (ruleId) => {
            const updatedRule = {
              ...allRules[ruleId],
              groupId: RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID,
            };
            Logger.log("Writing to storage in RulesTable ungroupSelectedRules");
            allPromises.push(StorageService(appMode).saveRuleOrGroup(updatedRule));
          });

          Promise.all(allPromises).then(() => resolve());
        });
    }
  });
};

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
