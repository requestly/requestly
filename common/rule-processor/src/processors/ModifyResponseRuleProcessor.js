import RuleHelper from "../RuleHelper";

class ModifyResponseRuleProcessor {
  static process({ rule, requestURL, details }) {
    // Response rule is always single paired
    var pair = rule.pairs[0];
    if (RuleHelper.matchUrlWithRulePair(pair, requestURL, details) === null) return null;

    if (!pair.response || !pair.response.type || !pair.response.value) return null;

    return {
      action: "modify_response",
      response: pair.response.value,
      responseType: pair.response.type,
      statusCode: pair.response.statusCode,
    };
  }
}

export default ModifyResponseRuleProcessor;
