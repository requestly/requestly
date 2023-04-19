import RuleHelper from "../RuleHelper";
import CONSTANTS from "../../../constants";

class UserAgentRuleProcessor {
  static process({ rule, requestURL, originalRequestHeaders = [], details = {} }) {
    let isRuleApplied = false;
    let newRequestHeaders = [...originalRequestHeaders];
    const ruleType = rule.ruleType;
    const rulePairs = rule.pairs || [];

    let mainFrameUrl = null;
    if (details && details.pageDomain) mainFrameUrl = details.pageDomain;

    for (let i = 0; i < rulePairs.length; i++) {
      let rulePair = rulePairs[i];

      let modification = RuleHelper.getHeaderModification(ruleType, rulePair);

      // If Source Value exists and does not match, proceed with next pair
      // In UA Rule Type, we match Source Object with mainFrame as well
      if (
        modification.source.value &&
        RuleHelper.matchUrlWithRuleSource(modification.source, requestURL) === null &&
        !(
          ruleType === CONSTANTS.RULE_TYPES.USERAGENT &&
          modification.source.requestType === CONSTANTS.REQUEST_TYPES.MAIN_FRAME &&
          mainFrameUrl &&
          RuleHelper.matchUrlWithRuleSource(modification.source, mainFrameUrl) !== null
        )
      ) {
        continue;
      }
      isRuleApplied = true;

      RuleHelper.replaceHeader(newRequestHeaders, {
        name: modification.header,
        value: modification.value,
      });
    }

    // If rule is not applied and we return headers object without any change, then chrome treats them as modification
    // And some websites break due to this.
    return isRuleApplied
      ? {
          action: "modify_user_agent",
          newRequestHeaders,
        }
      : null;
  }
}

export default UserAgentRuleProcessor;
