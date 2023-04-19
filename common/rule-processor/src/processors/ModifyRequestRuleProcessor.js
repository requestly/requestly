import RuleHelper from "../RuleHelper";

class ModifyRequestRuleProcessor {
  static process({ rule, requestURL, details }) {
    // Request rule is always single paired, just like Response Rule
    var pair = rule.pairs[0];
    if (RuleHelper.matchUrlWithRulePair(pair, requestURL, details) === null) return null;

    if (!pair.request || !pair.request.type || !pair.request.value) return null;

    return {
      action: "modify_request",
      request: pair.request.value,
      requestType: pair.request.type,
    };
  }
}

export default ModifyRequestRuleProcessor;
