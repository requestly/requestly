import { Rule } from "types";
import { Group } from "types";
import { recordsToContentTableDataAdapter } from "../../rulesList/components/RulesList/components/RulesTable/utils";

// TODO: Performance improvements
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
