import { HeaderRuleActionType, QueryParamModificationType } from "types";
import { RewriteRuleActionType } from "./types";

export const rewriteRuleActionTypes: Record<
  number,
  RewriteRuleActionType | HeaderRuleActionType | QueryParamModificationType
> = {
  1: HeaderRuleActionType.ADD,
  2: HeaderRuleActionType.REMOVE,
  3: HeaderRuleActionType.MODIFY,
  4: RewriteRuleActionType.HOST,
  5: RewriteRuleActionType.PATH,
  6: RewriteRuleActionType.URL,
  7: RewriteRuleActionType.BODY,
  8: QueryParamModificationType.ADD,
  9: QueryParamModificationType.ADD,
  10: QueryParamModificationType.REMOVE,
  11: RewriteRuleActionType.STATUS,
};
