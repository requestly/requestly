import { Rule, RuleObj } from "features/rules/types/rules";

export type RuleTableDataType = RuleObj & {
  children?: Rule[];
};
