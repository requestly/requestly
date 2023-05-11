import { RewriteRulePair, WhereToApplyRule } from "../types";
import { rewriteRuleActionTypes } from "./constants";
import { HeaderAction, QueryParamAction } from "./types";
import { generateObjectId } from "utils/FormattingHelper";
import { HeaderRuleActionType, HeadersRulePair, QueryParamModificationType, QueryParamRulePair } from "types";

export const getWhereToApplyRule = (pair: RewriteRulePair): WhereToApplyRule => {
  if (pair.matchRequest && pair.matchResponse) {
    return WhereToApplyRule.BOTH;
  } else if (pair.matchRequest) {
    return WhereToApplyRule.REQUEST;
  } else {
    return WhereToApplyRule.RESPONSE;
  }
};

// TODO: fix wrong name generation for modify query param
// eg: modification type = modify, name = Add ....
// this will happen since we do add/replace as a single option for query param
export const getModificationRuleName = (
  key: string = "",
  value: string = "",
  type: HeaderRuleActionType | QueryParamModificationType
): string => {
  switch (type) {
    case HeaderRuleActionType.ADD:
    case HeaderRuleActionType.MODIFY || QueryParamModificationType.ADD:
      return `${type} ${key}: ${value}`;

    case HeaderRuleActionType.REMOVE || QueryParamModificationType.REMOVE:
      return `${type} ${key}`;

    default:
      return ``;
  }
};

export const getHeadersData = (pair: RewriteRulePair) => {
  switch (rewriteRuleActionTypes[pair.ruleType]) {
    case HeaderRuleActionType.ADD:
      return { header: pair.newHeader || pair.matchHeader, value: pair.newValue };

    case HeaderRuleActionType.REMOVE:
      return { header: pair.matchHeader };

    case HeaderRuleActionType.MODIFY:
      return { header: pair.matchHeader, value: pair.newValue };

    default:
      return {};
  }
};

export const getQueryParamsData = (pair: RewriteRulePair) => {
  switch (rewriteRuleActionTypes[pair.ruleType]) {
    case QueryParamModificationType.ADD:
      return { param: pair.newHeader || pair.matchHeader, value: pair.newValue };

    case QueryParamModificationType.REMOVE:
      return { param: pair.matchHeader };

    default:
      return {};
  }
};

export const getHeaderModifications = ({
  header,
  value = "",
  actionType,
  whereToApply,
}: HeaderAction): Partial<HeadersRulePair["modifications"]> => {
  const getConfig = () => [{ id: generateObjectId(), header, value, type: actionType }];

  switch (whereToApply) {
    case WhereToApplyRule.BOTH:
      return {
        Request: getConfig(),
        Response: getConfig(),
      };

    case WhereToApplyRule.REQUEST:
      return {
        Request: getConfig(),
      };

    case WhereToApplyRule.RESPONSE:
      return {
        Response: getConfig(),
      };
  }
};

export const getQueryParamModifications = ({
  param,
  value = "",
  actionType,
}: QueryParamAction): Partial<QueryParamRulePair["modifications"]> => {
  return [{ id: generateObjectId(), param, value, type: actionType, actionWhenParamExists: "Overwrite" }];
};
