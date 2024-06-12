import { escapeRegExp } from "lodash";
import { ReplaceRule, ReplaceRulePair } from "../../../types/rules";
import { ExtensionRule, ExtensionRuleCondition, RuleActionType } from "../types";
import {
  convertRegexSubstitutionStringToDNRSubstitutionString,
  countCapturingGroups,
  getRegexSubstitutionStringWithIncrementedIndex,
  parseConditionFromSource,
  parseRegex,
} from "./utils";

const getReplaceMatchingRegex = (rulePair: ReplaceRulePair): ExtensionRuleCondition => {
  if (!rulePair.source.value) {
    const regexCondition = parseConditionFromSource(rulePair.source, false);
    return {
      ...regexCondition,
      regexFilter: `.*`,
    };
  } else {
    const regexCondition = parseConditionFromSource(rulePair.source, false);
    let finalRegexFilter = regexCondition.regexFilter;

    // Remove ^ & $
    if (finalRegexFilter?.[0] === "^") {
      finalRegexFilter = finalRegexFilter.slice(1);
    }
    if (finalRegexFilter?.[finalRegexFilter.length - 1] === "$") {
      finalRegexFilter = finalRegexFilter.slice(0, -1);
    }

    return {
      ...regexCondition,
      regexFilter: finalRegexFilter,
    };
  }
};

const parseReplaceRule = (rule: ReplaceRule): ExtensionRule[] => {
  const extensionRules: ExtensionRule[] = [];

  rule.pairs.forEach((rulePair, pairIndex) => {
    const matchingCondition = getReplaceMatchingRegex(rulePair);

    const redirectForSubstitutionRule: ExtensionRule = {
      priority: 1,
      condition: {
        ...matchingCondition,
        // To prevent infinite loops. First condition consumes the marker and returns the same redirected url. So stopping further redirections as same url
        // 1st alteration
        // https://example.com/v1/users/1234/hello#__rq_marker=https://example.com/v1/users/1234/hello
        // $1 = https://example.com/v1/users/1234/hello
        // $2 = #__rq_marker=https://example.com/v1/users/1234/hello
        // Final URL = https://example.com/v1/users/1234/hello#__rq_marker=https://example.com/v1/users/1234/hello

        // 2nd alteration: Used for first time redirect
        // https://example.com/v1/users/1234/hello
        // $3 = https://example.com/v1/users/1234/hello
        // Final URL = https://example.com/v1/users/1234/hello#__rq_marker=https://example.com/v1/users/1234/hello

        regexFilter: `^(${matchingCondition?.regexFilter})(#__rq_marker.*)$|(${
          parseConditionFromSource(rulePair.source)?.regexFilter
        })`,
        isUrlFilterCaseSensitive: matchingCondition?.isUrlFilterCaseSensitive,
      },
      action: {
        type: RuleActionType.REDIRECT,
        redirect: {
          regexSubstitution: `\\1\\3#__rq_marker=\\1\\3`,
        },
      },
    };

    const fromRegex = parseRegex(rulePair.from);
    let replacementRegex = `(.*)${escapeRegExp(rulePair.from)}(.*)`;
    let regexSubstitution = `\\1${rulePair.to}\\2`;

    if (fromRegex) {
      console.log("[Debug] is a regex", { from: rulePair.from });
      const num_capturing_groups = countCapturingGroups(fromRegex.pattern);

      if (num_capturing_groups === 0) {
        console.log("[Debug]", { num_capturing_groups });
        replacementRegex = `(.*?)${fromRegex.pattern}(.*)`;
        regexSubstitution = `\\1${rulePair.to}\\2`;
      } else {
        console.log("[Debug]", { num_capturing_groups });
        
        replacementRegex = `(.*?)${fromRegex.pattern}(.*)`;
        const s1 = getRegexSubstitutionStringWithIncrementedIndex(rulePair.to, 1);
        const s2 = convertRegexSubstitutionStringToDNRSubstitutionString(s1);
        console.log({ s1, s2 });

        regexSubstitution = `\\1${s2}\\${num_capturing_groups + 2}`;
      }
    } else {
      console.log("[Debug] is not a regex", { from: rulePair.from });
      replacementRegex = `(.*)${escapeRegExp(rulePair.from)}(.*)`;
      regexSubstitution = `\\1${rulePair.to}\\2`;
    }

    console.log("[Debug]", {replacementRegex, regexSubstitution})

    const finalRegex = `^${replacementRegex}#__rq_marker=(?:${matchingCondition.regexFilter})$`;

    let substitutionRule: ExtensionRule = {
      priority: 2,
      condition: {
        ...matchingCondition,
        regexFilter: finalRegex,
      },
      action: {
        type: RuleActionType.REDIRECT,
        redirect: {
          regexSubstitution: regexSubstitution,
        },
      },
    };

    extensionRules.push(...[redirectForSubstitutionRule, substitutionRule]);
  });

  return extensionRules;
};

export default parseReplaceRule;
