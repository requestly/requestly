import {
  Rule,
  RuleType,
  SourceKey,
  SourceOperator,
  RulePairSource,
  ResponseRule,
  ResponseRulePair,
  ResponseRuleResourceType,
} from "types";

const updateRulePairSource = <T extends Rule>(data: any, rule: T): T => {
  const source: RulePairSource = {
    value: data?.url ?? "",
    key: SourceKey.URL,
    operator: SourceOperator.EQUALS,
  };

  return {
    ...rule,
    pairs: [{ ...rule.pairs[0], source: { ...rule.pairs[0].source, ...source } }],
  };
};

const prefillResponseRuleData = <T extends ResponseRule>(data: any, newRule: T): T => {
  const updatedRule = updateRulePairSource(data, newRule);
  const response: Partial<ResponseRulePair["response"]> = {
    resourceType: ResponseRuleResourceType.REST_API,
  };

  return {
    ...updatedRule,
    pairs: [
      {
        ...updatedRule.pairs[0],
        response: { ...updatedRule.pairs[0].response, ...response },
      },
    ],
  };
};

export const prefillRuleData = <T extends Rule>(data: any, rule: T): T => {
  switch (rule.ruleType) {
    case RuleType.REDIRECT:
    case RuleType.REQUEST:
    case RuleType.REPLACE:
    case RuleType.HEADERS:
    case RuleType.CANCEL:
    case RuleType.SCRIPT:
    case RuleType.DELAY:
    case RuleType.QUERYPARAM:
    case RuleType.USERAGENT:
      return updateRulePairSource(data, rule);
    case RuleType.RESPONSE:
      //@ts-ignore
      return prefillResponseRuleData(data, rule);
    default:
      return rule;
  }
};
