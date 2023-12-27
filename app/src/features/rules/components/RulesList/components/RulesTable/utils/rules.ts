import { RuleTableDataType } from "../types";
import { Rule, RuleObj, RuleObjStatus, RuleObjType } from "features/rules/types/rules";

export const isRule = (record: RuleObj) => {
  return record.objectType === RuleObjType.RULE;
};

export const convertToArray = <T>(record: T | T[]): T[] => {
  return Array.isArray(record) ? record : [record];
};

export const getActiveRules = (records: RuleObj[]) => {
  return records.filter((record) => record.status === RuleObjStatus.ACTIVE);
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
