import { ReplaceRule, ReplaceRulePair } from "../../../types/rules";
import { ExtensionRule, ExtensionRuleCondition, RuleActionType } from "../types";
import { escapeForwardSlashes, parseSourceConditionV2 } from "./utils";

const getReplaceMatchingRegex = (rulePair: ReplaceRulePair): ExtensionRuleCondition => {
  if (!rulePair.source.value) {
    return {
      regexFilter: `(?=.*${rulePair.from}).*`,
      isUrlFilterCaseSensitive: true,
    };
  } else {
    const regexCondition = parseSourceConditionV2(rulePair.source, false);
    const matchingRegex = `(?=${regexCondition.regexFilter})(?=.*${escapeForwardSlashes(rulePair.from)})`;
    return {
      regexFilter: matchingRegex,
      isUrlFilterCaseSensitive: regexCondition.isUrlFilterCaseSensitive,
    };
  }
};

const parseReplaceRule = (rule: ReplaceRule): ExtensionRule[] => {
  const extensionRules: ExtensionRule[] = [];

  rule.pairs.forEach((rulePair, pairIndex) => {
    const subsitutionRegex = `(.*)${escapeForwardSlashes(rulePair.from)}(.*)`;
    const { regexFilter: matchingRegex, isUrlFilterCaseSensitive } = getReplaceMatchingRegex(rulePair);
    const finalRegex = `${matchingRegex}${subsitutionRegex}`;

    let replacePairExtensionRule: ExtensionRule = {
      priority: 1,
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

    extensionRules.push({ ...replacePairExtensionRule });
  });
  return extensionRules;
};

export default parseReplaceRule;
