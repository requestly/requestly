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

    if (!pair.response || !pair.response.type || !pair.response.value) return null;

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
