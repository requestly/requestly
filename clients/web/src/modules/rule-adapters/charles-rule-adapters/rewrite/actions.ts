import { RewriteRulePair, SourceData } from "../types";
import {
  getHeadersData,
  getQueryParamsData,
  getWhereToApplyRule,
  getHeaderModifications,
  getModificationRuleName,
  getQueryParamModifications,
} from "./helpers";
import { rewriteRuleActionTypes } from "./constants";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { RewriteRuleActionType } from "./types";
import { statusCodes } from "config/constants/sub/statusCode";
import {
  HeaderRule,
  QueryParamRule,
  RecordStatus,
  ReplaceRule,
  RequestRule,
  ResponseRule,
  RuleSourceOperator,
  RuleType,
} from "@requestly/shared/types/entities/rules";

export const createModifyHeaderRule = (pair: RewriteRulePair, source: SourceData) => {
  const headerAction = {
    ...getHeadersData(pair),
    active: pair.active,
    whereToApply: getWhereToApplyRule(pair),
    actionType: rewriteRuleActionTypes[pair.ruleType] as HeaderRule.ModificationType,
  };

  const newRule = getNewRule(RuleType.HEADERS) as HeaderRule.Record;
  const modifications = getHeaderModifications(headerAction);

  const ruleToBeImported = {
    ...newRule,
    isCharlesImport: true,
    status: headerAction.active ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
    name: getModificationRuleName(headerAction.header, headerAction.value, headerAction.actionType),
    pairs: [
      {
        ...newRule.pairs[0],
        source: { ...newRule.pairs[0].source, value: source.value, operator: source.operator },
        modifications: {
          ...newRule.pairs[0].modifications,
          ...modifications,
        },
      },
    ],
  };

  return ruleToBeImported;
};

export const createModifyQueryParamRule = (pair: RewriteRulePair, source: SourceData) => {
  const queryParamAction = {
    ...getQueryParamsData(pair),
    active: pair.active,
    ruleType: RuleType.QUERYPARAM,
    actionType: rewriteRuleActionTypes[pair.ruleType] as QueryParamRule.ModificationType,
  };

  const newRule = getNewRule(RuleType.QUERYPARAM) as QueryParamRule.Record;

  const ruleToBeImported = {
    ...newRule,
    isCharlesImport: true,
    status: queryParamAction.active ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
    name: getModificationRuleName(queryParamAction.param, queryParamAction.value, queryParamAction.actionType),
    pairs: [
      {
        ...newRule.pairs[0],
        source: { ...newRule.pairs[0].source, value: source.value, operator: source.operator },
        modifications: getQueryParamModifications(queryParamAction),
      },
    ],
  };

  return ruleToBeImported;
};

export const createModifyStatusRule = (pair: RewriteRulePair, source: SourceData) => {
  const newRule = getNewRule(RuleType.RESPONSE) as ResponseRule.Record;

  const ruleToBeImported = {
    ...newRule,
    isCharlesImport: true,
    name: `Modify status code to ${pair.newValue}`,
    status: pair.active ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
    pairs: [
      {
        ...newRule.pairs[0],
        source: { ...newRule.pairs[0].source, value: source.value, operator: source.operator },
        response: {
          ...newRule.pairs[0].response,
          statusCode: `${pair.newValue}`,
          //@ts-ignore
          statusText: statusCodes[pair.newValue],
          type: GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE,
          resourceType: ResponseRule.ResourceType.REST_API,
          value: RULE_TYPES_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE].RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE,
        },
      },
    ],
  };

  return ruleToBeImported;
};

const getReplaceRuleNamePrefix = (type: RewriteRulePair["ruleType"]) => {
  if (rewriteRuleActionTypes[type] === RewriteRuleActionType.HOST) {
    return "Host";
  } else if (rewriteRuleActionTypes[type] === RewriteRuleActionType.PATH) {
    return "Path";
  } else if (rewriteRuleActionTypes[type] === RewriteRuleActionType.URL) {
    return "URL";
  } else {
    return "";
  }
};

export const createReplaceRule = (pair: RewriteRulePair, source: SourceData) => {
  const newRule = getNewRule(RuleType.REPLACE) as ReplaceRule.Record;

  const ruleToBeImported = {
    ...newRule,
    isCharlesImport: true,
    name: `${getReplaceRuleNamePrefix(pair.ruleType)} ${pair.matchValue} -> ${pair.newValue}`,
    status: pair.active ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
    pairs: [
      {
        ...newRule.pairs[0],
        source: {
          ...newRule.pairs[0].source,
          value: source.value,
          operator: pair.matchValueRegex ? RuleSourceOperator.MATCHES : RuleSourceOperator.CONTAINS,
        },
        from: pair.matchValue,
        to: pair.newValue,
      },
    ],
  };

  return ruleToBeImported;
};

const getUpdatedBody = (defaultBody: string, pair: RewriteRulePair, bodyObject: "body" | "response") => {
  return defaultBody.replace(
    `return ${bodyObject};`,
    `return JSON.parse(JSON.stringify(${bodyObject}).${pair.replaceType === 1 ? `replace` : `replaceAll`}('${
      pair.matchValue
    }', '${pair.newValue}'));`
  );
};

export const createModifyBodyRule = (pair: RewriteRulePair, source: SourceData) => {
  const defaultRequestBody =
    RULE_TYPES_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.REQUEST].REQUEST_BODY_JAVASCRIPT_DEFAULT_VALUE;

  const defaultResponseBody =
    RULE_TYPES_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE].RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE;

  const updatedRequestBody = getUpdatedBody(defaultRequestBody, pair, "body");
  const updatedResponseBody = getUpdatedBody(defaultResponseBody, pair, "response");

  if (pair.matchRequest && pair.matchResponse) {
    const requestRule = getNewRule(RuleType.REQUEST) as RequestRule.Record;
    const responseRule = getNewRule(RuleType.RESPONSE) as ResponseRule.Record;

    const updatedRequestRule = {
      ...requestRule,
      isCharlesImport: true,
      name: `Modify request body`,
      status: pair.active ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
      pairs: [
        {
          ...requestRule.pairs[0],
          source: { ...requestRule.pairs[0].source, value: source.value, operator: source.operator },
          request: {
            ...requestRule.pairs[0].request,
            value: updatedRequestBody,
            type: GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE,
          },
        },
      ],
    };

    const updatedResponseRule = {
      ...responseRule,
      isCharlesImport: true,
      name: `Modify response body`,
      status: pair.active ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
      pairs: [
        {
          ...responseRule.pairs[0],
          source: { ...responseRule.pairs[0].source, value: source.value, operator: source.operator },
          response: {
            ...responseRule.pairs[0].response,
            type: GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE,
            resourceType: ResponseRule.ResourceType.REST_API,
            value: updatedResponseBody,
          },
        },
      ],
    };

    return [updatedRequestRule, updatedResponseRule];
  } else if (pair.matchRequest) {
    const requestRule = getNewRule(RuleType.REQUEST) as RequestRule.Record;

    const updatedRequestRule = {
      ...requestRule,
      isCharlesImport: true,
      name: `Modify request body`,
      status: pair.active ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
      pairs: [
        {
          ...requestRule.pairs[0],
          source: { ...requestRule.pairs[0].source, value: source.value, operator: source.operator },
          request: {
            ...requestRule.pairs[0].request,
            value: updatedRequestBody,
            type: GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE,
          },
        },
      ],
    };
    return updatedRequestRule;
  } else {
    const responseRule = getNewRule(RuleType.RESPONSE) as ResponseRule.Record;

    const updatedResponseRule = {
      ...responseRule,
      isCharlesImport: true,
      name: `Modify response body`,
      status: pair.active ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
      pairs: [
        {
          ...responseRule.pairs[0],
          source: { ...responseRule.pairs[0].source, value: source.value, operator: source.operator },
          response: {
            ...responseRule.pairs[0].response,
            type: GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE,
            resourceType: ResponseRule.ResourceType.REST_API,
            value: updatedResponseBody,
          },
        },
      ],
    };

    return updatedResponseRule;
  }
};
