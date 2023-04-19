import RuleHelper from "../RuleHelper";
import LOCAL_CONSTANTS from "../constants";

class BlockRequestRuleProcessor {
  static process({ rule, requestURL, details }) {
    const url = requestURL;
    let resultingUrl = RuleHelper.matchUrlWithRulePairs(rule.pairs, url, details);

    //  return resultingUrl && resultingUrl !== url
    return typeof resultingUrl === "string" && resultingUrl.length === 0
      ? { action: LOCAL_CONSTANTS.ACTIONS.BLOCK }
      : null;
  }
}

export default BlockRequestRuleProcessor;
