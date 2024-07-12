import { escapeRegExp } from "lodash";
import { ReplaceRule, ReplaceRulePair, SourceKey, SourceOperator } from "../../../types/rules";
import { ExtensionRule, ExtensionRuleCondition, RuleActionType } from "../types";
import {
  convertRegexSubstitutionStringToDNRSubstitutionString,
  countCapturingGroups,
  getRegexSubstitutionStringWithIncrementedIndex,
  parseConditionFromSource,
  parseRegex,
} from "./utils";
import Logger from "../../../../../common/logger";

const getReplaceMatchingRegex = (rulePair: ReplaceRulePair): ExtensionRuleCondition => {
  if (!rulePair.source.value) {
    const regexCondition = parseConditionFromSource(rulePair.source, true, false);
    return {
      ...regexCondition,
      regexFilter: `.*`,
    };
  } else {
    const regexCondition = parseConditionFromSource(rulePair.source, true, false);
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

const generateReplaceExtensionRules = (rulePair: ReplaceRulePair): ExtensionRule[] => {
  // Case 1 - Replace from in URL source condition
  // Edgecase: Will not replace `from` if not present in the source condition url
  if (
    rulePair.source.key === SourceKey.URL &&
    (rulePair.source.operator === SourceOperator.CONTAINS || rulePair.source.operator === SourceOperator.EQUALS) &&
    rulePair.source.value.includes(rulePair.from)
  ) {
    Logger.log("Replace Rule: Case 1");
    let regexFilter = "";
    let regexSubstitution = "";
    let currentSubstitutionIndex = 1;

    if (rulePair.source.operator === SourceOperator.CONTAINS) {
      regexFilter = `(.*?)`;
      regexSubstitution = `\\${currentSubstitutionIndex++}`;
    }

    const nonMatchingParts = rulePair.source.value.split(rulePair.from);
    nonMatchingParts.forEach((part, index) => {
      // Means matches in the beginning or end of the string)
      if (index === 0 && part === "") {
        regexFilter = regexFilter + `${escapeRegExp(rulePair.from)}`;
        regexSubstitution = regexSubstitution + `${rulePair.to}`;
      } else if (index === nonMatchingParts.length - 1) {
        if (part === "") {
          // Already handled `from` in previous part iteration
        } else {
          regexFilter = regexFilter + `(${escapeRegExp(part)})`;
          regexSubstitution = regexSubstitution + `\\${currentSubstitutionIndex++}`;
        }
      } else {
        regexFilter = regexFilter + `(${escapeRegExp(part)})${escapeRegExp(rulePair.from)}`;
        regexSubstitution = regexSubstitution + `\\${currentSubstitutionIndex++}${rulePair.to}`;
      }
    });

    if (rulePair.source.operator === SourceOperator.CONTAINS) {
      regexFilter = regexFilter + `(.*)`;
      regexSubstitution = regexSubstitution + `\\${currentSubstitutionIndex++}`;
    } else if (rulePair.source.operator === SourceOperator.EQUALS) {
      regexFilter = `^${regexFilter}$`;
    }

    Logger.log("Replace Rule: Case 1 - Regex Filter: ", { regexFilter, regexSubstitution });
    return [
      {
        priority: 1,
        condition: {
          ...parseConditionFromSource(rulePair.source, true, false),
          regexFilter: regexFilter,
        },
        action: {
          type: RuleActionType.REDIRECT,
          redirect: {
            regexSubstitution: regexSubstitution,
          },
        },
      },
    ];
  }
  // REST of the Cases
  else {
    Logger.log("Replace Rule: Case 2");
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
          parseConditionFromSource(rulePair.source, true, false)?.regexFilter
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
    let replacementRegex = "";
    let regexSubstitution = "";

    if (fromRegex?.pattern) {
      const num_capturing_groups = countCapturingGroups(fromRegex.pattern);

      if (num_capturing_groups === 0) {
        replacementRegex = `(.*?)${fromRegex.pattern}(.*)`;
        regexSubstitution = `\\1${rulePair.to}\\2`;
      } else {
        replacementRegex = `(.*?)${fromRegex.pattern}(.*)`;
        const s1 = getRegexSubstitutionStringWithIncrementedIndex(rulePair.to, 1);
        const s2 = convertRegexSubstitutionStringToDNRSubstitutionString(s1);

        regexSubstitution = `\\1${s2}\\${num_capturing_groups + 2}`;
      }
    } else {
      replacementRegex = `(.*)${escapeRegExp(rulePair.from)}(.*)`;
      regexSubstitution = `\\1${rulePair.to}\\2`;
    }

    const finalRegex = `^${replacementRegex}#__rq_marker=(?:${matchingCondition.regexFilter})$`;

    let replacementRule: ExtensionRule = {
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

    return [redirectForSubstitutionRule, replacementRule];
  }
};

const parseReplaceRule = (rule: ReplaceRule): ExtensionRule[] => {
  const extensionRules: ExtensionRule[] = [];

  rule.pairs.forEach((rulePair, pairIndex) => {
    const extensionRulesForPair = generateReplaceExtensionRules(rulePair);
    extensionRules.push(...extensionRulesForPair);
  });

  return extensionRules;
};

export default parseReplaceRule;
