import { HeaderRule, QueryParamRule } from "@requestly/shared/types/entities/rules";
import { RewriteRuleActionType } from "./types";

export const rewriteRuleActionTypes: Record<
  number,
  RewriteRuleActionType | HeaderRule.ModificationType | QueryParamRule.ModificationType
> = {
  1: HeaderRule.ModificationType.ADD,
  2: HeaderRule.ModificationType.REMOVE,
  3: HeaderRule.ModificationType.MODIFY,
  4: RewriteRuleActionType.HOST,
  5: RewriteRuleActionType.PATH,
  6: RewriteRuleActionType.URL,
  7: RewriteRuleActionType.BODY,
  8: QueryParamRule.ModificationType.ADD,
  9: QueryParamRule.ModificationType.ADD,
  10: QueryParamRule.ModificationType.REMOVE,
  11: RewriteRuleActionType.STATUS,
};
