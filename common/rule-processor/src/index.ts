import RuleProcessorFactory from "./RuleProcessorFactory";

// Expose rule processor Instance from this module
export function getInstance(ruleType: string) {
  return RuleProcessorFactory.getRuleProcessorInstance(ruleType);
}

export { default as RuleMatcher } from "./RuleHelper";
