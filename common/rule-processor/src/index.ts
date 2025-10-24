import RuleProcessorFactory from "./RuleProcessorFactory";
import RuleMatcher from "./RuleHelper";

// Expose rule processor Instance from this module
export function getInstance(ruleType: string) {
  return RuleProcessorFactory.getRuleProcessorInstance(ruleType);
}
export { RuleMatcher };
