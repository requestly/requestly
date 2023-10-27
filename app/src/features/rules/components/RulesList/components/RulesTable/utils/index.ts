import { RuleTableDataType } from "../types";
import { Rule, RuleObj } from "features/rules/types/rules";

// FIXME: Performance Improvements
export const rulesToContentTableDataAdapter = (rules: RuleObj[]): RuleTableDataType[] => {
  const ruleTableDataTypeMap: { [id: string]: RuleTableDataType } = {};

  const groupRules = rules.filter((rule) => !!rule.groupId) as Rule[];
  const nonGroupRules: RuleObj[] = rules.filter((rule) => !rule.groupId);

  nonGroupRules.forEach((rule) => {
    ruleTableDataTypeMap[rule.id] = rule;
  });

  groupRules.forEach((rule) => {
    if (ruleTableDataTypeMap[rule.groupId]) {
      ruleTableDataTypeMap[rule.groupId]["children"] = ruleTableDataTypeMap[rule.groupId]?.children
        ? [...ruleTableDataTypeMap[rule.groupId].children, rule]
        : [rule];
    } else {
      // GroupId doesn't exist
      ruleTableDataTypeMap[rule.id] = rule;
    }
  });

  const finalAdaptedData = Object.values(ruleTableDataTypeMap);
  console.log({ finalAdaptedData });
  return finalAdaptedData;
};
