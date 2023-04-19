import LOCAL_CONSTANTS from "../constants";
import RuleHelper from "../RuleHelper";

class RedirectRuleProcessor {
  static process({ rule, requestURL, details }) {
    let resultingUrl = RuleHelper.matchUrlWithRulePairs(rule.pairs, requestURL, details);
    // processedUrl = RuleMatcher.matchValueForPredefinedFunctions(
    //   processedUrl,
    //   RQ.PreDefinedFunctions
    // );
    return resultingUrl && resultingUrl !== requestURL
      ? {
          action: LOCAL_CONSTANTS.ACTIONS.REDIRECT,
          url: resultingUrl,
          preserveCookie: rule.preserveCookie,
        }
      : null;
  }
}

export default RedirectRuleProcessor;
