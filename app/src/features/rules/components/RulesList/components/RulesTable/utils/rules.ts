import { RuleTableDataType } from "../types";
import { Rule, RuleObj, RuleObjStatus, RuleObjType } from "features/rules/types/rules";

export const isRule = (record: RuleObj) => {
  return record.objectType === RuleObjType.RULE;
};

export const convertToArray = <T>(record: T | T[]): T[] => {
  return Array.isArray(record) ? record : [record];
};

export const getActiveRules = (records: RuleObj[]) => {
  let activeRecords: RuleObj[] = [];
  const seenGroupIds = new Set<string>();
  const rules: RuleObj[] = [];
  const groups: Record<string, RuleObj> = {};

  records.forEach((record) => {
    if (isRule(record) && record.status === RuleObjStatus.ACTIVE) {
      rules.push(record);
    } else if (!isRule(record)) {
      groups[record.id] = record;
    }
  });

  rules.forEach((rule) => {
    if (rule.groupId && groups[rule.groupId] && !seenGroupIds.has(rule.groupId)) {
      activeRecords.push(groups[rule.groupId]);
      seenGroupIds.add(rule.groupId);
    }
  });
  return [...activeRecords, ...rules];
};

export const getPinnedRules = (recordsMap: Record<string, RuleObj>) => {
  let pinnedRecords: RuleObj[] = [];

  Object.values(recordsMap).forEach((record) => {
    //If a group is pinned then show all the rules in that group (irrespective of whether they are pinned or not)
    if (record.isFavourite || (isRule(record) && record.groupId && recordsMap[record.groupId].isFavourite)) {
      pinnedRecords.push(record);
    }
  });

  return pinnedRecords;
};

// FIXME: Performance Improvements
export const rulesToContentTableDataAdapter = (rules: RuleObj[]): RuleTableDataType[] => {
  const ruleTableDataTypeMap: { [id: string]: RuleTableDataType } = {};

  const groupRules = rules.filter((rule) => !!rule.groupId) as Rule[];
  const nonGroupRules: RuleObj[] = rules
    .filter((rule) => !rule.groupId)
    .map((rule) => (rule.objectType === RuleObjType.GROUP ? { ...rule, children: [] } : rule));

  nonGroupRules.forEach((rule) => {
    ruleTableDataTypeMap[rule.id] = rule;
  });

  groupRules.forEach((rule) => {
    if (ruleTableDataTypeMap[rule.groupId]) {
      const updatedGroup = {
        ...ruleTableDataTypeMap[rule.groupId],
        children: [...ruleTableDataTypeMap[rule.groupId].children, rule],
      };
      ruleTableDataTypeMap[rule.groupId] = updatedGroup;
    } else {
      // GroupId doesn't exist
      ruleTableDataTypeMap[rule.id] = rule;
    }
  });

  const finalAdaptedData = Object.values(ruleTableDataTypeMap);

  return finalAdaptedData;
};
