import RuleHelper from "../RuleHelper";
import CONSTANTS from "../../../constants";

class ScriptRuleProcessor {
  static process({ rule, requestURL }) {
    // Script rule is always single paired
    var pair = rule.pairs[0];

    if (RuleHelper.matchUrlWithRulePair(pair, requestURL) === null) return null;

    var libraries = [],
      scripts = [];

    pair.libraries &&
      pair.libraries.forEach(function (library) {
        if (!libraries.includes(library)) {
          libraries.push(library);
        }
      });

    scripts = scripts.concat(pair.scripts || []);

    var cssScripts = scripts.filter(function (script) {
      return script.codeType === CONSTANTS.SCRIPT_CODE_TYPES.CSS;
    });

    var jsScripts = scripts.filter(function (script) {
      return !script.codeType || script.codeType === CONSTANTS.SCRIPT_CODE_TYPES.JS;
    });

    return {
      action: "insert",
      data: {
        cssScripts,
        jsScripts,
        libraries,
      },
    };
  }
}

export default ScriptRuleProcessor;
