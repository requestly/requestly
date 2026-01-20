import { generateObjectId } from "../FormattingHelper";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";

export const setIdsOfSingleRulePairs = (rule) => {
  switch (rule.ruleType) {
    case GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM:
      rule.pairs.map((pair) => {
        pair.id = pair.id || generateObjectId();
        pair.modifications.map((modification) => (modification.id = modification.id || generateObjectId()));
        return pair;
      });
      break;

    case GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT:
      rule.pairs.map((pair) => {
        pair.id = pair.id || generateObjectId();
        pair.scripts.map((script) => (script.id = script.id || generateObjectId()));
        return pair;
      });
      break;

    default:
      rule.pairs.map((pair) => {
        pair.id = pair.id || generateObjectId();
        return pair;
      });
      break;
  }
  return rule;
};

export const setIdsOfRulePairs = (rulesArray) => {
  return rulesArray.map((rule) => setIdsOfSingleRulePairs(rule));
};
