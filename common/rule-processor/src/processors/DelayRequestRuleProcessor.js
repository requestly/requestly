import RuleHelper from "../RuleHelper";

/* CONSTANTS */
import LOCAL_CONSTANTS from "../constants";
import CONSTANTS from "../../../constants";

class DelayRequestRuleProcessor {
  static process({ rule, requestURL, details }) {
    let pairs = rule.pairs,
      pair = null,
      resultingUrl = requestURL,
      delay = null,
      delayType = null;

    for (let i = 0; i < pairs.length; i++) {
      pair = pairs[i];

      // If Source does not match, proceed with next pair
      if (
        !RuleHelper.matchRequestWithRuleSourceFilters(pair.source.filters, details) ||
        RuleHelper.matchUrlWithRuleSource(pair.source, requestURL) === null
      ) {
        continue;
      }

      // If Source Value exists and does not match, proceed with next pair
      if (pair.source && pair.source.value && RuleHelper.matchUrlWithRuleSource(pair.source, resultingUrl) === null) {
        continue;
      }

      // resultingUrl = RuleHelper.matchValueForPredefinedFunctions(
      //   resultingUrl,
      //   RQ.PreDefinedFunctions
      // );

      delay = pair.delay;
      delayType = pair.delayType || CONSTANTS.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.CLIENT_SIDE;

      return {
        action: LOCAL_CONSTANTS.ACTIONS.ADD_DELAY,
        delay: delay,
        delayType: delayType,
      };
    }

    return null;
  }
}
export default DelayRequestRuleProcessor;
