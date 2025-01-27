import { Rule, RuleType } from "@requestly/shared/types/entities/rules";
import { ExtensionRule } from "../types";
import parseCancelRule from "./parseCancelRule";
import parseDelayRule from "./parseDelayRule";
import parseHeadersRule from "./parseHeadersRule";
import parseQueryParamRule from "./parseQueryParamRule";
import parseRedirectRule from "./parseRedirectRule";
import parseReplaceRule from "./parseReplaceRule";
import parseScriptRule from "./parseScriptRule";
import parseUserAgentRule from "./parseUserAgentRule";

type DNRRuleParser = (rule: Rule) => ExtensionRule[];

const parsers: { [key in RuleType]?: DNRRuleParser } = {
  [RuleType.REDIRECT]: parseRedirectRule,
  [RuleType.CANCEL]: parseCancelRule,
  [RuleType.QUERYPARAM]: parseQueryParamRule,
  [RuleType.HEADERS]: parseHeadersRule,
  [RuleType.USERAGENT]: parseUserAgentRule,
  [RuleType.DELAY]: parseDelayRule,
  [RuleType.REPLACE]: parseReplaceRule,
  [RuleType.SCRIPT]: parseScriptRule,
};

export const parseDNRRules: DNRRuleParser = (rule) => {
  return parsers[rule.ruleType]?.(rule);
};
