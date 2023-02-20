import isEmpty from "is-empty";
//CONSTANTS
import APP_CONSTANTS from "config/constants";
//REDUCER ACTION OBJECTS
import { actions } from "store";
import { StorageService } from "../../../../../../init";
//Utils

const { RULES_LIST_TABLE_CONSTANTS } = APP_CONSTANTS;

export const updateRulesListRefreshPendingStatus = (
  dispatch,
  isRulesListRefreshPending
) => {
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
      StorageService(appMode)
        .getAllRecords()
        .then((allRules) => {
          selectedRuleIds.forEach(async (ruleId) => {
            const updatedRule = {
              ...allRules[ruleId],
              groupId: RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID,
            };
            allPromises.push(
              StorageService(appMode).saveRuleOrGroup(updatedRule)
            );
          });

          Promise.all(allPromises).then(() => resolve());
        });
    }
  });
};

export const deleteGroup = (
  appMode,
  groupId,
  groupwiseRulesToPopulate,
  forceDelete
) => {
  if (forceDelete) return StorageService(appMode).removeRecord(groupId);

  if (!groupwiseRulesToPopulate[groupId]) {
    return Promise.reject("Invalid Group");
  }
  if (isEmpty(groupwiseRulesToPopulate[groupId]["group_rules"])) {
    return StorageService(appMode).removeRecord(groupId);
  } else {
    return Promise.resolve({ err: "ungroup-rules-first" });
  }
};
