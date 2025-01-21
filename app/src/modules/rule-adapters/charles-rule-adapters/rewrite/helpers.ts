import { RewriteRulePair, WhereToApplyRule } from "../types";
import { rewriteRuleActionTypes } from "./constants";
import { HeaderAction, QueryParamAction } from "./types";
import { generateObjectId } from "utils/FormattingHelper";
import { HeaderRule, QueryParamRule } from "@requestly/shared/types/entities/rules";

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
  type: HeaderRule.ModificationType | QueryParamRule.ModificationType
): string => {
  switch (type) {
    case HeaderRule.ModificationType.ADD:
    case HeaderRule.ModificationType.MODIFY || QueryParamRule.ModificationType.ADD:
      return `${type} ${key}: ${value}`;

    case HeaderRule.ModificationType.REMOVE || QueryParamRule.ModificationType.REMOVE:
      return `${type} ${key}`;

    default:
      return ``;
  }
};

export const getHeadersData = (pair: RewriteRulePair) => {
  switch (rewriteRuleActionTypes[pair.ruleType]) {
    case HeaderRule.ModificationType.ADD:
      return { header: pair.newHeader || pair.matchHeader, value: pair.newValue };

    case HeaderRule.ModificationType.REMOVE:
      return { header: pair.matchHeader };

    case HeaderRule.ModificationType.MODIFY:
      return { header: pair.matchHeader, value: pair.newValue };

    default:
      return {};
  }
};

export const getQueryParamsData = (pair: RewriteRulePair) => {
  switch (rewriteRuleActionTypes[pair.ruleType]) {
    case QueryParamRule.ModificationType.ADD:
      return { param: pair.newHeader || pair.matchHeader, value: pair.newValue };

    case QueryParamRule.ModificationType.REMOVE:
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
}: HeaderAction): Partial<HeaderRule.Pair["modifications"]> => {
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
}: QueryParamAction): Partial<QueryParamRule.Pair["modifications"]> => {
  return [{ id: generateObjectId(), param, value, type: actionType, actionWhenParamExists: "Overwrite" }];
};
