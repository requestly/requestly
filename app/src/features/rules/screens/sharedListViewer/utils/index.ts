import { Group, Rule } from "@requestly/shared/types/entities/rules";

export const getFilterSharedListRecords = (records: Array<Group | Rule>, searchValue: string) => {
  return records.filter((record) => {
    return record.name.toLowerCase().includes(searchValue.toLowerCase());
  });
};

export const generateGroupwiseRulesMap = (rules: Rule[]) => {
  if (!rules) return {};

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
