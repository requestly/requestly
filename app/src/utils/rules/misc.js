//UTILS
import { StorageService } from "../../init";
//CONSTANTS
import APP_CONSTANTS from "../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//CONSTANTS
const { RULES_LIST_TABLE_CONSTANTS } = APP_CONSTANTS;
const GROUP_DETAILS = RULES_LIST_TABLE_CONSTANTS.GROUP_DETAILS;

const processRules = (
  rule,
  groupIdsArr,
  isGroupIdAlreadyAdded,
  _sanitizeRules = true
) => {
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

export const getRulesAndGroupsFromRuleIds = (
  appMode,
  selectedRuleIds,
  groupwiseRules
) => {
  return new Promise((resolve) => {
    const groupIdsArr = [];
    const isGroupIdAlreadyAdded = {};

    StorageService(appMode)
      .getAllRecords()
      .then((allRecords) => {
        //Fetch Required Rules
        const rules = selectedRuleIds.map((ruleId) =>
          processRules(
            allRecords[ruleId],
            groupIdsArr,
            isGroupIdAlreadyAdded,
            true
          )
        );

        const groups = [];
        //Fetch Required Groups
        groupIdsArr.forEach((groupId) => {
          groups.push(
            groupwiseRules[groupId][RULES_LIST_TABLE_CONSTANTS.GROUP_DETAILS]
          );
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
    StorageService(appMode)
      .getAllRecords()
      .then((allRecords) => {
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
          return processRules(
            rule,
            groupIdsArr,
            isGroupIdAlreadyAdded,
            _sanitizeRules
          );
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
  const comparisonKeyForObject1 = object1.modificationDate
    ? object1.modificationDate
    : object1.creationDate;
  const comparisonKeyForObject2 = object2.modificationDate
    ? object2.modificationDate
    : object2.creationDate;

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

// TODO: remove it- commenting it for now as no header found to be unmodifiable from this list
// export const canBrowserModifyHeader = (header = "") => {
//   if (isDesktopMode()) return true;
//   const UNMODIFIABLE_HEADERS = [
//     "Authorization",
//     "Cache-Control",
//     "Connection",
//     "Content-Length",
//     "Host",
//     "If-Modified-Since",
//     "If-None-Match",
//     "If-Range",
//     "Partial-Data",
//     "Pragma",
//     "Proxy-Authorization",
//     "Proxy-Connection",
//     "Transfer-Encoding",
//   ];

//   return !UNMODIFIABLE_HEADERS.find(
//     (unmodifiableHeader) =>
//       unmodifiableHeader.toLowerCase() === header.toLowerCase()
//   );
// };
