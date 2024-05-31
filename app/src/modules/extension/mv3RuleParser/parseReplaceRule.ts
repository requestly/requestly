import { ReplaceRule } from "../../../types/rules";
import { ExtensionRule, RuleActionType } from "../types";
import { parseConditionFromSource } from "./utils";

const MARKER_QUERY_PARAM = "__rq_marker__";

const parseReplaceRule = (rule: ReplaceRule): ExtensionRule[] => {
  const extensionRules: ExtensionRule[] = [];

  rule.pairs.forEach((rulePair, pairIndex) => {
    if (!rulePair.source.value) {
      const ruleCondition = {
        condition: {
          ...parseConditionFromSource(rulePair.source),
          regexFilter: `(.*)${rulePair.from}(.*)`,
        },
        action: {
          type: RuleActionType.REDIRECT,
          redirect: {
            regexSubstitution: `\\1${rulePair.to}\\2`,
          },
        },
      };
      extensionRules.push(ruleCondition);
      return;
    }

    const markerValue = `${rule.id}_${pairIndex}`;

    const rulePairExtensionRules: ExtensionRule[] = [
      {
        priority: 1,
        condition: parseConditionFromSource(rulePair.source),
        action: {
          type: RuleActionType.REDIRECT,
          redirect: {
            transform: {
              queryTransform: {
                addOrReplaceParams: [
                  {
                    key: MARKER_QUERY_PARAM,
                    value: markerValue,
                  },
                ],
              },
            },
          },
        },
      },
      {
        priority: 2,
        condition: {
          regexFilter: `(.*)${rulePair.from}(.*${MARKER_QUERY_PARAM}=${markerValue}.*)`,
        },
        action: {
          type: RuleActionType.REDIRECT,
          redirect: {
            regexSubstitution: `\\1${rulePair.to}\\2`,
          },
        },
      },
    ];

    extensionRules.push(...rulePairExtensionRules);
  });

  return extensionRules;
};

export default parseReplaceRule;
