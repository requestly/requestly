import { HeaderRule, QueryParamRule } from "@requestly/shared/types/entities/rules";
import { RewriteRuleActionType } from "./types";

export const rewriteRuleActionTypes: Record<
  number,
  RewriteRuleActionType | HeaderRule.HeaderRuleActionType | QueryParamRule.QueryParamModificationType
> = {
  1: HeaderRule.HeaderRuleActionType.ADD,
  2: HeaderRule.HeaderRuleActionType.REMOVE,
  3: HeaderRule.HeaderRuleActionType.MODIFY,
  4: RewriteRuleActionType.HOST,
  5: RewriteRuleActionType.PATH,
  6: RewriteRuleActionType.URL,
  7: RewriteRuleActionType.BODY,
  8: QueryParamRule.QueryParamModificationType.ADD,
  9: QueryParamRule.QueryParamModificationType.ADD,
  10: QueryParamRule.QueryParamModificationType.REMOVE,
  11: RewriteRuleActionType.STATUS,
};
