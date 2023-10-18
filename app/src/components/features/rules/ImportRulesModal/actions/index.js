import { StorageService } from "../../../../../init";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "../../../../../config/constants";
//FUNCTIONS
import { setIdsOfSingleRulePairs } from "../../../../../utils/rules/set-ids-of-rules-pairs";
import { generateObjectId } from "../../../../../utils/FormattingHelper";
import Logger from "lib/logger";
import { runRuleMigrations } from "utils/rules/ruleMigrations";
//CONSTANTS
const { RULES_LIST_TABLE_CONSTANTS } = APP_CONSTANTS;

export const addRulesAndGroupsToStorage = (appMode, array) => {
  Logger.log("Writing to storage in addRulesAndGroupsToStorage");
  return StorageService(appMode).saveMultipleRulesOrGroups(array);
};

const setNewIdOfRulePairs = (incomingArray) => {
  return incomingArray.forEach((object) => {
    if (object.objectType === GLOBAL_CONSTANTS.OBJECT_TYPES.RULE) {
      return setIdsOfSingleRulePairs(object);
    } else {
      return object;
    }
  });
};

const filterRulesAndGroups = (incomingArray) => {
  const rules = [];
  const groups = [];
  const groupsId = {};

  const pushToGroups = (object) => {
    groups.push(object);
    groupsId[object.id] = true;
  };

  incomingArray.forEach((object) =>
    object.objectType === GLOBAL_CONSTANTS.OBJECT_TYPES.RULE
      ? rules.push(object)
      : object.objectType === GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP
      ? pushToGroups(object)
      : null
  );
  return {
    rules: rules,
    groups: groups,
    groupsId: groupsId,
  };
};

const isObjectValid = (object) => {
  const objectType = [GLOBAL_CONSTANTS.OBJECT_TYPES.RULE, GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP];
  const objectStatus = [GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE, GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE];

  return objectType.includes(object.objectType) &&
    objectStatus.includes(object.objectStatus) &&
    typeof object.name === "string" &&
    object.description
    ? typeof object.description === "string"
    : true;
};

// const setNewCreationDate = (incomingArray) => {
//   return incomingArray.forEach((object) => {
//     object.creationDate = generateObjectCreationDate();
//     return object;
//   });
// };

const setNewIdofRules = (incomingArray) => {
  return incomingArray.forEach((object) => {
    object.id = `${object.ruleType}_${generateObjectId()}`;
    return object;
  });
};
// const setNewIdofGroups = (incomingArray) => {
//   return incomingArray.map((object) => {
//     object.id = `Group_${generateObjectId()}`;
//     return object;
//   });
// };

const setUnknownGroupIdsToUngroupped = (rulesArray, groupsIdObject) => {
  return rulesArray.map((rule) => {
    return {
      ...rule,
      groupId: groupsIdObject[rule.groupId] ? rule.groupId : RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID,
    };
  });
};

export const processDataToImport = (incomingArray, user, allRules, overwrite = true) => {
  const data = filterRulesAndGroups(incomingArray);
  const rules = runRuleMigrations(data.rules.filter((object) => isObjectValid(object)));
  const groups = data.groups.filter((object) => isObjectValid(object));

  // setNewCreationDate(rules);
  // setNewCreationDate(groups);

  if (!overwrite) {
    setNewIdofRules(rules);
    setNewIdOfRulePairs(rules);
  }

  //For Rules which do not have a valid Group associated, move them to Ungrouped
  setUnknownGroupIdsToUngroupped(rules, data.groupsId);
  //Merge valid rules & groups
  const importedRulesAndGroups = rules.concat(groups);

  const currentOwner = user?.details?.profile?.uid || null;

  const combinedRulesAndGroups = [];
  if (rules.length || groups.length) {
    importedRulesAndGroups.forEach((data) => {
      const updatedData = { ...data, currentOwner };
      combinedRulesAndGroups.push(updatedData);
    });
  }

  return new Promise(function (resolve) {
    resolve({
      data: combinedRulesAndGroups,
      rulesCount: rules.length,
      groupsCount: groups.length,
    });
  });
};
