import RuleHelper from "../RuleHelper";
import CONSTANTS from "../../../constants";

class ModifyResponseRuleProcessor {
  static process({ rule, requestURL, details }) {
    // Response rule is always single paired
    let pair = rule.pairs[0];
    const isResponseTypeLocalFile = pair.response.type === CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE;
    if (isResponseTypeLocalFile) {
      pair.destination = pair.response.value;
    }
    const resultingUrl = RuleHelper.matchUrlWithRulePair(pair, requestURL, details);
    if (resultingUrl === null) return null;

    // Allow rules that only modify status code without requiring response body
    // Don't return null if response exists (even without type)
    if (!pair.response) return null;

    // At least one of: response value, status code, or serveWithoutRequest must be specified
    if (!pair.response.value && !pair.response.statusCode && !pair.response.serveWithoutRequest) return null;
    return {
      action: "modify_response",
      response: isResponseTypeLocalFile ? resultingUrl : pair.response.value,
      responseType: pair.response.type,
      statusCode: pair.response.statusCode,
      serveWithoutRequest: !!pair.response.serveWithoutRequest,
    };
  }
}

export default ModifyResponseRuleProcessor;
