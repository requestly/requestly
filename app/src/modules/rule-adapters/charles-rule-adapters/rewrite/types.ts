import { HeaderRule, QueryParamRule, RuleType } from "@requestly/shared/types/entities/rules";
import { WhereToApplyRule } from "../types";

export enum RewriteRuleActionType {
  URL = "url",
  PATH = "path",
  HOST = "host",
  STATUS = "status",
  BODY = "body",
}

export type HeaderAction = Partial<{
  header: string;
  value: string;
  active: boolean;
  ruleType: RuleType;
  whereToApply: WhereToApplyRule;
  actionType: HeaderRule.ModificationType;
}>;

export type QueryParamAction = Partial<{
  param: string;
  value: string;
  active: boolean;
  ruleType: RuleType;
  actionType: QueryParamRule.ModificationType;
  actionWhenParamExists: string;
}>;
