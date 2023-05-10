import { get } from "lodash";
import { RewriteRule, RewriteRulePair, RewriteRulePairs, RewriteSet } from "../types";
import { generateObjectId } from "utils/FormattingHelper";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { HeaderRuleActionType, HeadersRule, HeadersRulePair, RuleType, Status } from "types";
import { convertToArray } from "../utils";

// Cases
// [] headers
// [] query parms
// [] status
// [] host
// [] path
// [] url
// [] body

enum WhereToApplyRule {
  BOTH = "both",
  REQUEST = "request",
  RESPONSE = "response",
}

type HeaderAction = Partial<{
  header: string;
  value: string;
  ruleType: RuleType;
  whereToApply: WhereToApplyRule;
  actionType: HeaderRuleActionType;
}>;

const ModifyHeaderAction: Record<number, HeaderRuleActionType> = {
  1: HeaderRuleActionType.ADD,
  2: HeaderRuleActionType.REMOVE,
  3: HeaderRuleActionType.MODIFY,
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
    }
    // TODO: add rest processors ie 4 to 11
    return result;
  }, {} as Record<RuleType, RewriteRulePair[]>);
};

const getHeadersData = (pair: RewriteRulePair) => {
  switch (ModifyHeaderAction[pair.ruleType]) {
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

const getHeadersModification = ({
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

const getHeaderModificationRuleName = (header: string, value: string = "", type: HeaderRuleActionType): string => {
  switch (type) {
    case HeaderRuleActionType.ADD:
    case HeaderRuleActionType.MODIFY:
      return `${type}  ${header} -> ${value}`;

    case HeaderRuleActionType.REMOVE:
      return `${type}  ${header}`;

    default:
      return ``;
  }
};

const createHeaderRules = (pairs: RewriteRulePairs) => {
  const rewriteRulePairs = convertToArray(pairs);
  const processedRulePairs = processRulePairs(rewriteRulePairs);
  const headersRulePairs = processedRulePairs[RuleType.HEADERS];

  console.log({ rewriteRulePairs, processedRulePairs, headersRulePairs });

  // create the rule and fill the configs
  // at the end fill the source URLs as it will be same for all the rules
  // then optimise for doing it in single pass

  const headerActions = headersRulePairs.reduce(
    (result, pair) => [
      ...result,
      {
        ...getHeadersData(pair),
        ruleType: RuleType.HEADERS, // might not needed
        whereToApply: getWhereToApplyRule(pair),
        actionType: ModifyHeaderAction[pair.ruleType],
      },
    ],
    [] as HeaderAction[]
  );

  console.log({ headerActions });

  const exportedHeaderRules = headerActions.map((action) => {
    const newRule = getNewRule(RuleType.HEADERS) as HeadersRule;
    const modifications = getHeadersModification(action);

    return {
      ...newRule,
      status: Status.ACTIVE,
      isCharlesExported: true,
      name: getHeaderModificationRuleName(action.header, action.value, action.actionType),
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

  console.log({ rewriteHeadersRules: exportedHeaderRules });
  return exportedHeaderRules;
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

      createHeaderRules(rules.rewriteRule);
      resolve();
    });
  });
};
