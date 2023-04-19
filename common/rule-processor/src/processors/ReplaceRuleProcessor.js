import { toRegex } from "../../../utils";
import RuleHelper from "../RuleHelper";

class ReplaceRuleProcessor {
  static process({ rule, requestURL, details }) {
    let pairs = rule.pairs,
      pair = null,
      from = null,
      isFromPartRegex,
      resultingUrl = requestURL;

    for (let i = 0; i < pairs.length; i++) {
      pair = pairs[i];
      pair.from = pair.from || "";

      if (pair.source && !RuleHelper.matchRequestWithRuleSourceFilters(pair.source.filters, details)) {
        continue;
      }

      // If Source Value exists and does not match, proceed with next pair
      if (pair.source && pair.source.value && RuleHelper.matchUrlWithRuleSource(pair.source, resultingUrl) === null) {
        continue;
      }

      // When string pair.from looks like a RegExp, create a RegExp object from it
      from = toRegex(pair.from);
      isFromPartRegex = from !== null;

      from = from || pair.from;

      // Use String.match method when from is Regex otherwise use indexOf
      // Issue-86: String.match("?a=1") fails with an error
      if ((isFromPartRegex && resultingUrl.match(from)) || resultingUrl.indexOf(from) !== -1) {
        resultingUrl = resultingUrl.replace(from, pair.to);
      }
    }

    return resultingUrl !== requestURL ? { action: "redirect", url: resultingUrl } : null;
  }
}

export default ReplaceRuleProcessor;
