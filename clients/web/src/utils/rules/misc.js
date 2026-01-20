//CONSTANTS
import APP_CONSTANTS from "../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import Logger from "lib/logger";
import { setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";
import { isRule } from "features/rules";
import { RedirectRule } from "@requestly/shared/types/entities/rules";
import clientRuleStorageService from "services/clientStorageService/features/rule";

const { RULE_TYPES_CONFIG, RULES_LIST_TABLE_CONSTANTS } = APP_CONSTANTS;
const GROUP_DETAILS = RULES_LIST_TABLE_CONSTANTS.GROUP_DETAILS;

const processRules = (rule, groupIdsArr, isGroupIdAlreadyAdded, _sanitizeRules = true) => {
  if (rule.groupId !== RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID) {
    if (!isGroupIdAlreadyAdded[rule.groupId]) {
      groupIdsArr.push(rule.groupId);
      isGroupIdAlreadyAdded[rule.groupId] = true;
    }
  }
  if (_sanitizeRules) return sanitizeRule(rule);
  return rule;
};

const sanitizeRule = (rule) => {
  const sanitizedRule = rule;
  delete sanitizedRule.isFavourite; // https://github.com/requestly/requestly/issues/205
  return sanitizedRule;
};

export const getRuleConfigInEditMode = (rule) => {
  if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.HEADERS) {
    if (!rule.version) {
      return RULE_TYPES_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.HEADERS_V1];
    }
  }

  return RULE_TYPES_CONFIG[rule.ruleType];
};

/**
 *
 * @param {string} appMode
 * @param {import("@requestly/shared/types/entities/rules").Rule["id"][]} selectedRuleIds
 * @returns {Promise<{
 *  rules: import("@requestly/shared/types/entities/rules").Rule[],
 *  groups: import("@requestly/shared/types/entities/rules").Group[]
 * }>}
 */
export const getRulesAndGroupsFromRuleIds = (appMode, selectedRuleIds) => {
  return new Promise((resolve) => {
    const groupIdsArr = [];
    const isGroupIdAlreadyAdded = {};

    Logger.log("Reading storage in getRulesAndGroupsFromRuleIds");
    clientRuleStorageService.getAllRulesAndGroups().then((allRecords) => {
      //Fetch Required Rules
      const rules = selectedRuleIds.map((ruleId) =>
        processRules(allRecords[ruleId], groupIdsArr, isGroupIdAlreadyAdded, true)
      );

      const groups = [];
      //Fetch Required Groups
      groupIdsArr.forEach((groupId) => {
        groups.push(allRecords?.[groupId]);
      });

      resolve({
        rules,
        groups,
      });
    });
  });
};

export const getAllRulesAndGroups = (appMode, _sanitizeRules = true) => {
  return new Promise((resolve) => {
    Logger.log("Reading storage in getAllRulesAndGroups");
    clientRuleStorageService.getAllRulesAndGroups().then((allRecords) => {
      const groupIdsArr = [];
      const isGroupIdAlreadyAdded = {};
      let allRules = [],
        allGroups = {};
      for (let recordId in allRecords) {
        if (allRecords[recordId] && allRecords[recordId].objectType) {
          switch (allRecords[recordId].objectType) {
            case GLOBAL_CONSTANTS.OBJECT_TYPES.RULE:
              allRules.push(allRecords[recordId]);
              break;

            case GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP:
              allGroups[recordId] = allRecords[recordId];
              break;

            default:
              break;
          }
        }
      }

      const rules = allRules.map((rule) => {
        return processRules(rule, groupIdsArr, isGroupIdAlreadyAdded, _sanitizeRules);
      });

      const groups = [];
      //Fetch Required Groups
      groupIdsArr.forEach((groupId) => {
        groups.push(allGroups[groupId]);
      });

      resolve({
        rules,
        groups,
      });
    });
  });
};

export const getAllRulesAndGroupsIds = (appMode) => {
  return new Promise((resolve) => {
    getAllRulesAndGroups(appMode, false).then(({ rules, groups }) => {
      const allRuleIds = rules.map((object) => object.id);
      const allGroupsIds = groups.map((object) => object.id);
      resolve([...allRuleIds, ...allGroupsIds]);
      return;
    });
  });
};

export const compareRuleByModificationDate = (object1, object2) => {
  const comparisonKeyForObject1 = object1.modificationDate ? object1.modificationDate : object1.creationDate;
  const comparisonKeyForObject2 = object2.modificationDate ? object2.modificationDate : object2.creationDate;

  if (comparisonKeyForObject1 < comparisonKeyForObject2) {
    return 1;
  }
  if (comparisonKeyForObject1 > comparisonKeyForObject2) {
    return -1;
  }
  return 0;
};

export const compareGroupToPopulateByModificationDate = (array1, array2) => {
  const comparisonKeyForArray1 = array1[1][GROUP_DETAILS].modificationDate
    ? array1[1][GROUP_DETAILS].modificationDate
    : array1[1][GROUP_DETAILS].creationDate;
  const comparisonKeyForArray2 = array2[1][GROUP_DETAILS].modificationDate
    ? array2[1][GROUP_DETAILS].modificationDate
    : array2[1][GROUP_DETAILS].creationDate;

  if (comparisonKeyForArray1 < comparisonKeyForArray2) {
    return 1;
  }
  if (comparisonKeyForArray1 > comparisonKeyForArray2) {
    return -1;
  }
  return 0;
};

export const getExecutionLogsId = (ruleId) => {
  if (!ruleId) return null;
  return `execution_${ruleId}`;
};

export const isDesktopOnlyRule = (rule) => {
  if (rule?.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT) {
    const pairs = rule?.pairs;
    return pairs.some(
      ({ destinationType, destination }) =>
        destinationType === RedirectRule.DestinationType.MAP_LOCAL || destination?.startsWith("file://")
    );
  }
};

export const getAllRedirectDestinationTypes = (rule) => {
  const destinationTypes = rule.pairs?.map((pair) => pair?.destinationType);
  return destinationTypes;
};

export const getAllResponseBodyTypes = (rule) => {
  const bodyTypes = rule.pairs?.map((pair) => pair?.response?.type);
  return bodyTypes;
};

const regexFormat = "^/(.+)(/)(|i|g|ig|gi)$";

/**
 * Checks if the regex string is a valid regex or not
 * @param {string} regexStr
 * @returns {boolean}
 */
export const isValidRegex = (regexStr) => {
  try {
    // Checking if pattern matches
    const isValidRegexPattern = regexStr.search(new RegExp(regexFormat)) !== -1;
    if (!isValidRegexPattern) {
      return false;
    }
    // Checking if regex can be made using string
    new RegExp(regexStr);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Formats regex string by adding forward and trailing slashes
 * @param {string} regexStr
 * @returns {string}
 */
export const fixRegexStr = (regexStr) => {
  if (regexStr[0] !== "/") {
    regexStr = "/" + regexStr;
  }

  if (isValidRegex(regexStr)) {
    return regexStr;
  }

  if (regexStr[regexStr.length - 1] !== "/") {
    regexStr = regexStr + "/";
  }

  return regexStr;
};

export function runMinorFixesOnRule(dispatch, rule) {
  const rulePairs = rule.pairs.map((pair) => {
    let fixedPair = pair;
    // fix regex
    if (pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES) {
      if (!isValidRegex(pair.source.value)) {
        fixedPair = {
          ...pair,
          source: {
            ...pair.source,
            value: fixRegexStr(pair.source.value),
          },
        };
      }
    }
    // trim white space from source value
    fixedPair = {
      ...fixedPair,
      source: {
        ...fixedPair.source,
        value: fixedPair.source?.value?.trim(),
      },
    };

    return fixedPair;
  });

  const fixedRule = {
    ...rule,
    pairs: rulePairs,
  };

  setCurrentlySelectedRule(dispatch, fixedRule, true);

  return fixedRule;
}

export const getAllRulesOfGroup = (appMode, groupId) => {
  if (!groupId) return Promise.resolve([]);

  return new Promise((resolve) => {
    clientRuleStorageService
      .getAllRulesAndGroups()
      .then((allRecords) => {
        const groupRules = Object.values(allRecords).filter((record) => isRule(record) && record?.groupId === groupId);
        resolve(groupRules);
      })
      .catch((error) => {
        Logger.log(error);
        resolve([]);
      });
  });
};
