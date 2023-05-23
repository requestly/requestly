import {
  Rule,
  RuleType,
  SourceKey,
  SourceOperator,
  RulePairSource,
  ResponseRule,
  ResponseRulePair,
  ResponseRuleResourceType,
  RequestRule,
  RequestRulePair,
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

const prefillRequestRuleData = <T extends RequestRule>(data: unknown, newRule: T): T => {
  const updatedRule = updateRulePairSource(data, newRule);
  const updatedRequestData: Partial<RequestRulePair["request"]> = {
    // @ts-ignore
    value: data?.request?.body ?? "",
  };

  return {
    ...updatedRule,
    pairs: [
      {
        ...updatedRule.pairs[0],
        request: { ...updatedRule.pairs[0].request, ...updatedRequestData },
      },
    ],
  };
};

const prefillResponseRuleData = <T extends ResponseRule>(data: unknown, newRule: T): T => {
  const updatedRule = updateRulePairSource(data, newRule);
  const updatedResponseData: Partial<ResponseRulePair["response"]> = {
    // @ts-ignore
    value: data?.response?.body ?? "",
    resourceType: ResponseRuleResourceType.REST_API,
  };

  return {
    ...updatedRule,
    pairs: [
      {
        ...updatedRule.pairs[0],
        response: { ...updatedRule.pairs[0].response, ...updatedResponseData },
      },
    ],
  };
};

export const prefillRuleData = <T extends Rule>(data: any, rule: T): T => {
  switch (rule.ruleType) {
    case RuleType.REDIRECT:
    case RuleType.REQUEST:
      //@ts-ignore
      return prefillRequestRuleData(data, rule);
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
