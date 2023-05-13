import { WhereToApplyRule } from "../types";
import { HeaderRuleActionType, QueryParamModificationType, RuleType } from "types";

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
  actionType: HeaderRuleActionType;
}>;

export type QueryParamAction = Partial<{
  param: string;
  value: string;
  active: boolean;
  ruleType: RuleType;
  actionType: QueryParamModificationType;
  actionWhenParamExists: string;
}>;
