import { RedirectRule } from "../../../types/rules";
import { ExtensionRule, ExtensionRuleAction, RuleActionType } from "../types";
import { parseConditionFromSource } from "./utils";

const parseRedirectRule = (rule: RedirectRule): ExtensionRule[] => {
  const rulePairs = rule.pairs.filter((pair) => {
    if (pair?.destination?.startsWith("file://")) {
      return false;
    }
    return true;
  });

  return rulePairs.map(
    (rulePair): ExtensionRule => {
      const condition = parseConditionFromSource(rulePair.source);
      const action: ExtensionRuleAction = {
        type: RuleActionType.REDIRECT,
        redirect: {},
      };

      if (condition.regexFilter) {
        action.redirect.regexSubstitution = rulePair.destination.replace(/\$([1-9])/g, "\\$1");
      } else {
        action.redirect.url = rulePair.destination;
      }

      return { action, condition };
    }
  );
};

export default parseRedirectRule;
