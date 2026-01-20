import RuleHelper from "../RuleHelper";
import CONSTANTS from "../../../constants";

class HeadersRuleProcessor {
  static process({
    rule,
    requestURL,
    details,
    originalHeaders, // array [{ name: header_name,value: header_val }]
    typeOfHeaders, // Request or Response | Process all kinds if omitted,
    payload = {}, // Optional payload EX: {requestOrigin:STRING}
  }) {
    let isRuleApplied = false,
      rulePairs = rule.pairs || [];

    let newHeaders = [...originalHeaders];
    let ruleType = rule.ruleType;
    let modifications;
    for (let index = 0; index < rulePairs.length; index++) {
      let rulePair = rulePairs[index];
      if (RuleHelper.matchUrlWithRulePair(rulePair, requestURL, details) === null) {
        continue;
      }

      if (rule.version > 1) {
        modifications = rulePair.modifications[typeOfHeaders] || [];
      } else {
        modifications = [rulePair];
      }

      for (var modificationIndex = 0; modificationIndex < modifications.length; ++modificationIndex) {
        let modification = RuleHelper.getHeaderModification(ruleType, modifications[modificationIndex]);

        if ((!(rule.version > 1) && modification.target !== typeOfHeaders) || !modification.header) {
          continue;
        }

        isRuleApplied = true;

        // Check if user has used predefinedFunction in (add/modify) header value
        let valueWithPreDefFunctionsApplied = RuleHelper.matchValueForPredefinedFunctions(modification.value, payload);

        switch (modification.type) {
          case CONSTANTS.MODIFICATION_TYPES.ADD:
            RuleHelper.addHeader(newHeaders, {
              name: modification.header,
              value: valueWithPreDefFunctionsApplied,
            });
            break;

          case CONSTANTS.MODIFICATION_TYPES.REMOVE:
            RuleHelper.removeHeader(newHeaders, modification.header);
            break;

          case CONSTANTS.MODIFICATION_TYPES.MODIFY:
            RuleHelper.modifyHeaderIfExists(newHeaders, {
              name: modification.header,
              value: valueWithPreDefFunctionsApplied,
            });
            break;

          // This ensures header is sent only once.
          // If it is not present, we will add this header otherwise modify the existing one
          case CONSTANTS.MODIFICATION_TYPES.REPLACE:
            RuleHelper.replaceHeader(newHeaders, {
              name: modification.header,
              value: valueWithPreDefFunctionsApplied,
            });
            break;
        }
      }
    }
    // If rule is not applied and we return headers object without any change, then chrome treats them as modification
    // And some websites break due to this.
    return isRuleApplied
      ? {
          action: "modify_headers",
          newHeaders,
          originalHeaders,
        }
      : null;
  }
}

export default HeadersRuleProcessor;
