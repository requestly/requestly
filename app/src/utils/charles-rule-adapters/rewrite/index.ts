import { get } from "lodash";
import { RewriteRule, RewriteRulePair, RewriteSet } from "../types";
import { generateObjectId } from "utils/FormattingHelper";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import {
  Status,
  RuleType,
  HeadersRule,
  HeadersRulePair,
  HeaderRuleActionType,
  QueryParamRule,
  QueryParamRulePair,
  QueryParamModificationType,
  ResponseRuleResourceType,
  ResponseRule,
} from "types";
import { convertToArray } from "../utils";
import { statusCodes } from "config/constants/sub/statusCode";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";

// Cases
// [x] headers
// [x] query parms (1hr)
// [x] status (1hr)
// [] host (1hr)
// [] path (10min)
// [] url (10min)
// [] body (TBA)

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
  PATH = "path",
  HOST = "host",
  STATUS = "status",
}

const rewriteRuleActionTypes: Record<
  number,
  RewriteRuleActionType | HeaderRuleActionType | QueryParamModificationType
> = {
  1: HeaderRuleActionType.ADD,
  2: HeaderRuleActionType.REMOVE,
  3: HeaderRuleActionType.MODIFY,
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

// TODO: add source URL in all the rules

const processRulePairs = (pairs: RewriteRulePair[]) => {
  return pairs?.reduce((result, pair) => {
    if ([1, 2, 3].includes(pair.ruleType)) {
      return { ...result, [RuleType.HEADERS]: [...(result[RuleType.HEADERS] ?? []), pair] };
    } else if ([8, 9, 10].includes(pair.ruleType)) {
      return { ...result, [RuleType.QUERYPARAM]: [...(result[RuleType.QUERYPARAM] ?? []), pair] };
    } else if ([11].includes(pair.ruleType)) {
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

// create the rule and fill the configs
// at the end fill the source URLs as it will be same for all the rules
// then optimise for doing it in single pass
const createHeaderRules = (pairs: RewriteRulePair[] = []) => {
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

const createQueryParamRules = (pairs: RewriteRulePair[] = []) => {
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
  const exportedRules = pairs.map((pair) => {
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

export const rewriteRuleAdapter = (appMode: string, rules: RewriteRule): Promise<void> => {
  return new Promise((resolve, reject) => {
    const rewriteRules = get(rules, "rewrite.sets.rewriteSet");
    const updatedRewriteRules = convertToArray<RewriteSet>(rewriteRules);

    if (!rules || !rewriteRules) {
      reject();
      return;
    }

    // for each source url we need all the rules
    updatedRewriteRules.forEach(({ active, hosts, rules, name }: RewriteSet) => {
      const locations = hosts?.locationPatterns?.locationMatch;

      if (!locations) {
        return;
      }

      console.log({ locations });

      const rewriteRulePairs = convertToArray(rules.rewriteRule);
      const processedRulePairs = processRulePairs(rewriteRulePairs);

      console.log({ rewriteRulePairs, processedRulePairs });

      const headers = createHeaderRules(processedRulePairs[RuleType.HEADERS]);
      const queryparams = createQueryParamRules(processedRulePairs[RuleType.QUERYPARAM]);
      const status = createModifyStatusRules(processedRulePairs[RuleType.RESPONSE]);

      console.log({ status, headers, queryparams });

      resolve();
    });
  });
};
