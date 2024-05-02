import { Rule } from "types";
import APP_CONSTANTS from "config/constants";
import { Group } from "types";
import DataStoreUtils from "utils/DataStoreUtils";
import { getPublicSharedListPath } from "utils/db/UserModel";
import { recordsToContentTableDataAdapter } from "../../rulesList/components/RulesList/components/RulesTable/utils";

//CONSTANTS
const { PATHS } = APP_CONSTANTS;

export const getSharedListIdFromString = (sharedListIdString: string) => {
  /** URL Example: /dashboard/shared-lists/viewer/1600332541841-Demo */

  // Split by "-" to distinguish id and name
  return sharedListIdString.split("-")[0];
};

export const getSharedListIdFromURL = (url: string) => {
  /** URL Example: /dashboard/shared-lists/viewer/1600332541841-Demo */

  // Split by "/"
  const urlArray = url.split("/");

  // Use path varible to determine which index of this array would contain shared list id
  const numberOfSlashesInKnownPath = PATHS.SHARED_LISTS.VIEWER.ABSOLUTE.split("/").length;
  const requiredIndex = numberOfSlashesInKnownPath + 1 - 1; // +1 to Count the HOST part, -1 to convert arr length to arr index

  // Split by "-" to distinguish id and name
  return urlArray[requiredIndex].split("-")[0];
};

export const fetchSharedListData = (sharedListId: string) => {
  const publicSharedListPath = getPublicSharedListPath(sharedListId);
  return DataStoreUtils.getValue(publicSharedListPath);
};

export const getSharedListIdFromImportURL = (url: string) => {
  try {
    const urlStringArray = url.split("/");
    return urlStringArray[urlStringArray.length - 1].split("-")[0];
  } catch (err) {
    return null;
  }
};

export const getSharedListNameFromUrl = (url: string) => {
  try {
    const urlStringArray = url.split("/");
    return urlStringArray[urlStringArray.length - 1].split("-").splice(1).join("-");
  } catch (err) {
    return null;
  }
};

export const getFilterSharedListRecords = (
  sharedListGroupwiseRulesMap: Record<string, Rule[]>,
  sharedListGroupsMap: Record<string, Group>,
  searchValue: string
) => {
  const result = [];
  // filter ungrouped rules
  if (sharedListGroupwiseRulesMap?.ungrouped) {
    const filteredUngroupedRules = sharedListGroupwiseRulesMap.ungrouped?.filter((rule) =>
      rule.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    result.push(...filteredUngroupedRules);
  }

  const filteredGroupsIds = [] as string[];

  // filter groups
  Object.keys(sharedListGroupsMap).forEach((groupId) => {
    const group = sharedListGroupsMap[groupId];
    if (group?.name?.toLowerCase().includes(searchValue.toLowerCase())) {
      result.push(sharedListGroupsMap[groupId]);
      filteredGroupsIds.push(groupId);
    }
  });

  Object.keys(sharedListGroupwiseRulesMap).forEach((groupId) => {
    if (groupId === "ungrouped") return;
    // add all the rules if the group name matches the search value
    if (filteredGroupsIds.includes(groupId)) {
      result.push(...sharedListGroupwiseRulesMap[groupId]);
    } else {
      // filter rules from a group
      const filteredRules = sharedListGroupwiseRulesMap[groupId].filter((rule) =>
        rule.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      result.push(...filteredRules);
      //  push the group if any of its rules are present in the search results
      if (filteredRules.length > 0) {
        result.push(sharedListGroupsMap[groupId]);
      }
    }
  });
  // @ts-ignore
  return recordsToContentTableDataAdapter(result);
};

export const generateGroupwiseRulesMap = (rules: Rule[]) => {
  return rules.reduce(
    (map: Record<string, Rule[]>, rule: Rule) => {
      const { groupId } = rule;
      const groupKey = groupId || "ungrouped";
      if (!map[groupKey]) {
        map[groupKey] = [];
      }
      map[groupKey].push(rule);
      return map;
    },
    {
      ungrouped: [],
    }
  );
};
