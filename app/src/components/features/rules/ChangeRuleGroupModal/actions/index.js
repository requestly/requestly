import isEmpty from "is-empty";
//FUNCTIONS
import { generateObjectId } from "../../../../../utils/FormattingHelper";
//EXTERNALS
import { StorageService } from "../../../../../init";
//CONSTANT
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//ACTIONS
import { getSelectedRules } from "../../actions";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import Logger from "lib/logger";

export const createNewGroup = (appMode, newGroupName, callback, user) => {
  const newGroupId = `Group_${generateObjectId()}`;

  const newGroupObject = {
    creationDate: generateObjectCreationDate(),
    description: "",
    id: newGroupId,
    name: newGroupName,
    objectType: GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP,
    status: GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE,
  };

  Logger.log("Writing storage in createNewGroup");
  StorageService(appMode)
    .saveRuleOrGroup(newGroupObject)
    .then(async () => {
      callback(newGroupId);
    });
};

export const updateGroupOfSelectedRules = (appMode, rulesSelection, newGroupId, user) => {
  return new Promise((resolve, reject) => {
    // Filter only Selected Rules

    const selectedRules = getSelectedRules(rulesSelection);

    if (isEmpty(selectedRules)) {
      reject();
    }

    Logger.log("Reading storage in updateGroupOfSelectedRules");
    // Fetch all records to get rule data
    StorageService(appMode)
      .getAllRecords()
      .then((allRecords) => {
        //Update Rules
        const newRules = [];
        selectedRules.forEach(async (selectedRuleId) => {
          const newRule = {
            ...allRecords[selectedRuleId],
            groupId: newGroupId,
          };
          newRules.push(newRule);
        });
        StorageService(appMode)
          .saveMultipleRulesOrGroups(newRules)
          .then(() => resolve());
      });
  });
};
