import { escapeRegExp } from "lodash";
import { ReplaceRule, ReplaceRulePair } from "../../../types/rules";
import { ExtensionRule, ExtensionRuleCondition, RuleActionType } from "../types";
import { parseConditionFromSource, parseUrlParametersFromSourceV2 } from "./utils";

const getReplaceMatchingRegex = (rulePair: ReplaceRulePair): ExtensionRuleCondition => {
  if (!rulePair.source.value) {
    const regexCondition = parseUrlParametersFromSourceV2(rulePair.source, false);
    return {
      ...regexCondition,
      regexFilter: `.*`,
    };
  } else {
    const regexCondition = parseUrlParametersFromSourceV2(rulePair.source, false);
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
    const redirectWithMarkerRule: ExtensionRule = {
      priority: 1,
      condition: {
        regexFilter: `(${parseConditionFromSource(rulePair.source)?.regexFilter})`,
      },
      action: {
        type: RuleActionType.REDIRECT,
        redirect: {
          regexSubstitution: `\\1#__rq_marker=\\1`,
        },
      },
    };

    const subsitutionRegex = `(.*)${escapeRegExp(rulePair.from)}(.*)`;
    const { regexFilter: matchingRegex, isUrlFilterCaseSensitive } = getReplaceMatchingRegex(rulePair);
    const finalRegex = `^${subsitutionRegex}#__rq_marker=(?:${matchingRegex})$`;

    let substitutionRule: ExtensionRule = {
      priority: 2,
      condition: {
        regexFilter: finalRegex,
        isUrlFilterCaseSensitive,
      },
      action: {
        type: RuleActionType.REDIRECT,
        redirect: {
          regexSubstitution: `\\1${rulePair.to}\\2`,
        },
      },
    };

    extensionRules.push(...[redirectWithMarkerRule, substitutionRule]);
  });

  return extensionRules;
};

export default parseReplaceRule;
