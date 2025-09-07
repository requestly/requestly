import isEmpty from "is-empty";
//FUNCTIONS
import { generateObjectId } from "../../../../../utils/FormattingHelper";
//CONSTANT
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//ACTIONS
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import Logger from "lib/logger";
import clientRuleStorageService from "services/clientStorageService/features/rule";
import syncingHelper from "lib/syncing/helpers/syncingHelper";

export const createNewGroup = (appMode, newGroupName, callback, user, status = GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE) => {
  const newGroupId = `Group_${generateObjectId()}`;

  const newGroupObject = {
    status,
    id: newGroupId,
    name: newGroupName,
    description: "",
    creationDate: generateObjectCreationDate(),
    objectType: GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP,
  };

  Logger.log("Writing storage in createNewGroup");
  syncingHelper.saveRuleOrGroup(newGroupObject).then(async () => {
    callback(newGroupId);
  });
};

export const updateGroupOfSelectedRules = (appMode, selectedRuleIds, newGroupId, user) => {
  return new Promise((resolve, reject) => {
    // Filter only Selected Rules

    if (isEmpty(selectedRuleIds)) {
      reject();
    }

    Logger.log("Reading storage in updateGroupOfSelectedRules");
    // Fetch all records to get rule data
    clientRuleStorageService.getAllRulesAndGroups().then((allRecords) => {
      //Update Rules
      const newRules = [];
      selectedRuleIds.forEach(async (selectedRuleId) => {
        const newRule = {
          ...allRecords[selectedRuleId],
          groupId: newGroupId,
        };
        newRules.push(newRule);
      });
      syncingHelper.saveMultipleRulesOrGroups(newRules).then(() => resolve());
    });
  });
};
