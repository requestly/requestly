import { get } from "lodash";
import { RewriteRule, RewriteRulePair, RewriteSet } from "../types";
import { generateObjectId } from "utils/FormattingHelper";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import {
  Status,
  RuleType,
  ReplaceRule,
  HeadersRule,
  RequestRule,
  ResponseRule,
  SourceOperator,
  QueryParamRule,
  HeadersRulePair,
  QueryParamRulePair,
  HeaderRuleActionType,
  ResponseRuleResourceType,
  QueryParamModificationType,
} from "types";
import { convertToArray, getSourceUrls } from "../utils";
import { statusCodes } from "config/constants/sub/statusCode";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";

enum WhereToApplyRule {
  BOTH = "both",
  REQUEST = "request",
  RESPONSE = "response",
}

type HeaderAction = Partial<{
  header: string;
  value: string;
  active: boolean;
  ruleType: RuleType;
  whereToApply: WhereToApplyRule;
  actionType: HeaderRuleActionType;
}>;

type QueryParamAction = Partial<{
  param: string;
  value: string;
  active: boolean;
  ruleType: RuleType;
  actionType: QueryParamModificationType;
  actionWhenParamExists: string;
}>;

enum RewriteRuleActionType {
  URL = "url",
  PATH = "path",
  HOST = "host",
  STATUS = "status",
  BODY = "body",
}

const rewriteRuleActionTypes: Record<
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

const getWhereToApplyRule = (pair: RewriteRulePair): WhereToApplyRule => {
  if (pair.matchRequest && pair.matchResponse) {
    return WhereToApplyRule.BOTH;
  } else if (pair.matchRequest) {
    return WhereToApplyRule.REQUEST;
  } else {
    return WhereToApplyRule.RESPONSE;
  }
};

const processRulePairs = (pairs: RewriteRulePair[]) => {
  return pairs?.reduce((result, pair) => {
    if ([1, 2, 3].includes(pair.ruleType)) {
      return { ...result, [RuleType.HEADERS]: [...(result[RuleType.HEADERS] ?? []), pair] };
    } else if ([4, 5, 6].includes(pair.ruleType)) {
      return { ...result, [RuleType.REPLACE]: [...(result[RuleType.REPLACE] ?? []), pair] };
    } else if ([8, 9, 10].includes(pair.ruleType)) {
      return { ...result, [RuleType.QUERYPARAM]: [...(result[RuleType.QUERYPARAM] ?? []), pair] };
    } else if ([7, 11].includes(pair.ruleType)) {
      return { ...result, [RuleType.RESPONSE]: [...(result[RuleType.RESPONSE] ?? []), pair] };
    }
    return result;
  }, {} as Record<RuleType, RewriteRulePair[]>);
};

// TODO: fix wrong name generation for modify query param
// eg: modification type = modify, name = Add ....
// this will happen since we do add/replace as a single option for query param
const getModificationRuleName = (
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

const getHeadersData = (pair: RewriteRulePair) => {
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

const getQueryParamsData = (pair: RewriteRulePair) => {
  switch (rewriteRuleActionTypes[pair.ruleType]) {
    case QueryParamModificationType.ADD:
      return { param: pair.newHeader || pair.matchHeader, value: pair.newValue };

    case QueryParamModificationType.REMOVE:
      return { param: pair.matchHeader };

    default:
      return {};
  }
};

const getHeaderModifications = ({
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

const getQueryParamModifications = ({
  param,
  value = "",
  actionType,
}: QueryParamAction): Partial<QueryParamRulePair["modifications"]> => {
  return [{ id: generateObjectId(), param, value, type: actionType, actionWhenParamExists: "Overwrite" }];
};

const createModifyHeaderRules = (pairs: RewriteRulePair[] = []) => {
  const headerActions = pairs.reduce(
    (result, pair) => [
      ...result,
      {
        ...getHeadersData(pair),
        active: pair.active,
        ruleType: RuleType.HEADERS, // might not needed
        whereToApply: getWhereToApplyRule(pair),
        actionType: rewriteRuleActionTypes[pair.ruleType] as HeaderRuleActionType,
      },
    ],
    [] as HeaderAction[]
  );

  const exportedRules = headerActions.map((action) => {
    const newRule = getNewRule(RuleType.HEADERS) as HeadersRule;
    const modifications = getHeaderModifications(action);

    return {
      ...newRule,
      isCharlesExported: true,
      status: action.active ? Status.ACTIVE : Status.INACTIVE,
      name: getModificationRuleName(action.header, action.value, action.actionType),
      pairs: [
        {
          ...newRule.pairs[0],
          modifications: {
            ...newRule.pairs[0].modifications,
            ...modifications,
          },
        },
      ],
    };
  });

  return exportedRules;
};

const createModifyQueryParamRules = (pairs: RewriteRulePair[] = []) => {
  const queryParamActions = pairs.reduce(
    (result, pair) => [
      ...result,
      {
        ...getQueryParamsData(pair),
        active: pair.active,
        ruleType: RuleType.QUERYPARAM,
        actionType: rewriteRuleActionTypes[pair.ruleType] as QueryParamModificationType,
      },
    ],
    [] as QueryParamAction[]
  );

  const exportedRules = queryParamActions.map((action) => {
    const newRule = getNewRule(RuleType.QUERYPARAM) as QueryParamRule;

    return {
      ...newRule,
      isCharlesExported: true,
      status: action.active ? Status.ACTIVE : Status.INACTIVE,
      name: getModificationRuleName(action.param, action.value, action.actionType),
      pairs: [
        {
          ...newRule.pairs[0],
          modifications: getQueryParamModifications(action),
        },
      ],
    };
  });

  return exportedRules;
};

const createModifyStatusRules = (pairs: RewriteRulePair[] = []) => {
  const exportedRules = pairs
    .filter((pair) => pair.ruleType === 11)
    .map((pair) => {
      const newRule = getNewRule(RuleType.RESPONSE) as ResponseRule;

      return {
        ...newRule,
        isCharlesExport: true,
        name: `Modify status code to ${pair.newValue}`,
        status: pair.active ? Status.ACTIVE : Status.INACTIVE,
        pairs: [
          {
            ...newRule.pairs[0],
            response: {
              ...newRule.pairs[0].response,
              statusCode: `${pair.newValue}`,
              //@ts-ignore
              statusText: statusCodes[pair.newValue],
              type: GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE,
              resourceType: ResponseRuleResourceType.REST_API,
              value: RULE_TYPES_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE].RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE,
            },
          },
        ],
      };
    });

  return exportedRules;
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

const createReplaceRules = (pairs: RewriteRulePair[] = []) => {
  const exportedRules = pairs.map((pair) => {
    const newRule = getNewRule(RuleType.REPLACE) as ReplaceRule;

    return {
      ...newRule,
      isCharlesExport: true,
      name: `${getReplaceRuleNamePrefix(pair.ruleType)} ${pair.matchValue} -> ${pair.newValue}`,
      status: pair.active ? Status.ACTIVE : Status.INACTIVE,
      pairs: [
        {
          ...newRule.pairs[0],
          source: {
            ...newRule.pairs[0].source,
            operator: pair.matchValueRegex ? SourceOperator.MATCHES : SourceOperator.CONTAINS,
          },
          from: pair.matchValue,
          to: pair.newValue,
        },
      ],
    };
  });

  return exportedRules;
};

const getUpdatedBody = (defaultBody: string, pair: RewriteRulePair, bodyObject: "body" | "response") => {
  return defaultBody.replace(
    `return ${bodyObject};`,
    `return JSON.parse(JSON.stringify(${bodyObject}).${pair.replaceType === 1 ? `replace` : `replaceAll`}('${
      pair.matchValue
    }', '${pair.newValue}'));`
  );
};

const createModifyBodyRules = (pairs: RewriteRulePair[] = []) => {
  const exportedRules = pairs
    .filter((pair) => pair.ruleType === 7)
    .reduce((rules, pair) => {
      const defaultRequestBody =
        RULE_TYPES_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.REQUEST].REQUEST_BODY_JAVASCRIPT_DEFAULT_VALUE;

      const defaultResponseBody =
        RULE_TYPES_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE].RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE;

      const updatedRequestBody = getUpdatedBody(defaultRequestBody, pair, "body");
      const updatedResponseBody = getUpdatedBody(defaultResponseBody, pair, "response");

      if (pair.matchRequest && pair.matchResponse) {
        const requestRule = getNewRule(RuleType.REQUEST) as RequestRule;
        const responseRule = getNewRule(RuleType.RESPONSE) as ResponseRule;

        const updatedRequestRule = {
          ...requestRule,
          isCharlesExport: true,
          name: `Modify request body`,
          status: pair.active ? Status.ACTIVE : Status.INACTIVE,
          pairs: [
            {
              ...requestRule.pairs[0],
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
          isCharlesExport: true,
          name: `Modify response body`,
          status: pair.active ? Status.ACTIVE : Status.INACTIVE,
          pairs: [
            {
              ...responseRule.pairs[0],
              response: {
                ...responseRule.pairs[0].response,
                type: GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE,
                resourceType: ResponseRuleResourceType.REST_API,
                value: updatedResponseBody,
              },
            },
          ],
        };

        return [...rules, updatedRequestRule, updatedResponseRule];
      } else if (pair.matchRequest) {
        const requestRule = getNewRule(RuleType.REQUEST) as RequestRule;

        const updatedRequestRule = {
          ...requestRule,
          isCharlesExport: true,
          name: `Modify request body`,
          status: pair.active ? Status.ACTIVE : Status.INACTIVE,
          pairs: [
            {
              ...requestRule.pairs[0],
              request: {
                ...requestRule.pairs[0].request,
                value: updatedRequestBody,
                type: GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE,
              },
            },
          ],
        };
        return [...rules, updatedRequestRule];
      } else {
        const responseRule = getNewRule(RuleType.RESPONSE) as ResponseRule;

        const updatedResponseRule = {
          ...responseRule,
          isCharlesExport: true,
          name: `Modify response body`,
          status: pair.active ? Status.ACTIVE : Status.INACTIVE,
          pairs: [
            {
              ...responseRule.pairs[0],
              response: {
                ...responseRule.pairs[0].response,
                type: GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE,
                resourceType: ResponseRuleResourceType.REST_API,
                value: updatedResponseBody,
              },
            },
          ],
        };

        return [...rules, updatedResponseRule];
      }
    }, []);

  return exportedRules;
};

export const rewriteRuleAdapter = (appMode: string, rules: RewriteRule) => {
  const rewriteRules = get(rules, "rewrite.sets.rewriteSet");
  const updatedRewriteRules = convertToArray<RewriteSet>(rewriteRules);

  if (!rules || !rewriteRules) {
    return {};
  }

  const groupsToBeImported = updatedRewriteRules.reduce(
    (result, { hosts, rules }: RewriteSet) => {
      const locations = hosts?.locationPatterns?.locationMatch;

      if (!locations) {
        return result;
      }

      const rewriteRulePairs = convertToArray(rules.rewriteRule);
      const processedRulePairs = processRulePairs(rewriteRulePairs);

      const headersRules = createModifyHeaderRules(processedRulePairs[RuleType.HEADERS]);
      const queryparamRules = createModifyQueryParamRules(processedRulePairs[RuleType.QUERYPARAM]);
      const modifyStatusRules = createModifyStatusRules(processedRulePairs[RuleType.RESPONSE]);
      const replaceRules = createReplaceRules(processedRulePairs[RuleType.REPLACE]);
      const modifyResponseBodyRules = createModifyBodyRules(processedRulePairs[RuleType.RESPONSE]);

      // rewriteRulePairs.map((pair) => {
      //   switch(pair.ruleType){
      //       case 1:
      //       case 2:
      //       case 3:
      //         return createModifyHeaderRules(pair)
      //   }
      // })

      const rulesToBeImported = [
        ...headersRules,
        ...queryparamRules,
        ...modifyStatusRules,
        ...replaceRules,
        ...modifyResponseBodyRules,
      ];

      const sourceUrls = getSourceUrls(locations);
      const groups = sourceUrls.reduce((result, { value, operator, status }) => {
        const updatedRules = rulesToBeImported.map(
          (rule: HeadersRule | QueryParamRule | ReplaceRule | RequestRule | ResponseRule) => ({
            ...rule,
            pairs: [
              {
                ...rule.pairs[0],
                source: { ...rule.pairs[0].source, value, operator },
              },
            ],
          })
        );

        return [...result, { status, name: value, rules: updatedRules }];
      }, []);

      return { ...result, groups: [...result.groups, ...groups] };
    },
    { groups: [] }
  );

  return groupsToBeImported;
};
