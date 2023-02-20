import { Rule, RuleType } from "../../../types/rules";
import { ExtensionRule } from "../types";
import parseCancelRule from "./parseCancelRule";
import parseDelayRule from "./parseDelayRule";
import parseHeadersRule from "./parseHeadersRule";
import parseQueryParamRule from "./parseQueryParamRule";
import parseRedirectRule from "./parseRedirectRule";
import parseReplaceRule from "./parseReplaceRule";
import parseScriptRule from "./parseScriptRule";
import parseUserAgentRule from "./parseUserAgentRule";

type ExtensionRuleParser = (rule: Rule) => ExtensionRule[];

// eslint-disable-next-line no-unused-vars
const parsers: { [key in RuleType]?: ExtensionRuleParser } = {
  [RuleType.REDIRECT]: parseRedirectRule,
  [RuleType.CANCEL]: parseCancelRule,
  [RuleType.QUERYPARAM]: parseQueryParamRule,
  [RuleType.HEADERS]: parseHeadersRule,
  [RuleType.USERAGENT]: parseUserAgentRule,
  [RuleType.DELAY]: parseDelayRule,
  [RuleType.REPLACE]: parseReplaceRule,
  [RuleType.SCRIPT]: parseScriptRule,
};

export const parseExtensionRules: ExtensionRuleParser = (rule) => {
  return parsers[rule.ruleType]?.(rule);
};
