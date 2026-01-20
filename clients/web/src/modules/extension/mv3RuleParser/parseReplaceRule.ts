import { escapeRegExp } from "lodash";
import { ExtensionRule, ExtensionRuleCondition, RuleActionType } from "../types";
import {
  convertRegexSubstitutionStringToDNRSubstitutionString,
  countCapturingGroups,
  getRegexSubstitutionStringWithIncrementedIndex,
  parseConditionFromSource,
  parseRegex,
} from "./utils";
import { LOGGER as Logger } from "@requestly/utils";
import { ReplaceRule, RuleSourceKey, RuleSourceOperator } from "@requestly/shared/types/entities/rules";

const getReplaceMatchingRegex = (rulePair: ReplaceRule.Pair): ExtensionRuleCondition => {
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

const getReplacementExtensionRule = (rulePair: ReplaceRule.Pair): ExtensionRule => {
  const commonExtensionCondition = parseConditionFromSource(rulePair.source, true, false);
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

  return {
    priority: 1,
    condition: {
      ...commonExtensionCondition,
      regexFilter: replacementRegex,
    },
    action: {
      type: RuleActionType.REDIRECT,
      redirect: {
        regexSubstitution: regexSubstitution,
      },
    },
  };
};

const generateReplaceExtensionRules = (rulePair: ReplaceRule.Pair): ExtensionRule[] => {
  // Case 1 and 2 - Replace from in URL source condition
  // Edgecase: Will not replace `from` if not present in the source condition url
  if (
    rulePair.source.key === RuleSourceKey.URL &&
    (rulePair.source.operator === RuleSourceOperator.CONTAINS ||
      rulePair.source.operator === RuleSourceOperator.EQUALS) &&
    rulePair.source.value.includes(rulePair.from)
  ) {
    Logger.log("Replace Rule: Case 1 and 2");
    let regexFilter = "";
    let regexSubstitution = "";
    let currentSubstitutionIndex = 1;

    if (rulePair.source.operator === RuleSourceOperator.CONTAINS) {
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

    if (rulePair.source.operator === RuleSourceOperator.CONTAINS) {
      regexFilter = regexFilter + `(.*)`;
      regexSubstitution = regexSubstitution + `\\${currentSubstitutionIndex++}`;
    } else if (rulePair.source.operator === RuleSourceOperator.EQUALS) {
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
  } else if (!rulePair.source.value) {
    // Case 3
    Logger.log("Replace Rule: Case 3");
    return [getReplacementExtensionRule(rulePair)];
  }
  // REST of the Cases
  else {
    Logger.log("Replace Rule: Rest of the cases");
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

    const replacementRule = getReplacementExtensionRule(rulePair);
    const finalRegex = `^${replacementRule.condition.regexFilter}#__rq_marker=(?:${matchingCondition.regexFilter})$`;

    let replacementRuleWithMarker: ExtensionRule = {
      priority: 2,
      condition: {
        ...matchingCondition,
        regexFilter: finalRegex,
      },
      action: {
        type: RuleActionType.REDIRECT,
        redirect: {
          regexSubstitution: replacementRule.action.redirect.regexSubstitution,
        },
      },
    };

    return [redirectForSubstitutionRule, replacementRuleWithMarker];
  }
};

const parseReplaceRule = (rule: ReplaceRule.Record): ExtensionRule[] => {
  const extensionRules: ExtensionRule[] = [];

  rule.pairs.forEach((rulePair, pairIndex) => {
    const extensionRulesForPair = generateReplaceExtensionRules(rulePair);
    extensionRules.push(...extensionRulesForPair);
  });

  return extensionRules;
};

export default parseReplaceRule;
