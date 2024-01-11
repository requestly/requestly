import { Rule, RuleObj } from "features/rules/types/rules";

// todo : only for groups
export type RuleTableDataType = RuleObj & {
  children?: Rule[];
};
