import { DelayRule } from "../../../types/rules";
import { ExtensionRule, RuleActionType } from "../types";
import { parseConditionFromSource } from "./utils";

const parseDelayRule = (rule: DelayRule): ExtensionRule[] => {
  return rule.pairs.map(
    (rulePair): ExtensionRule => {
      return {
        priority: 1,
        condition: {
          ...parseConditionFromSource(rulePair.source),
        },
        action: {
          type: RuleActionType.REDIRECT,
          redirect: {
            transform: {
              queryTransform: {
                addOrReplaceParams: [
                  {
                    key: "_rq_delay_",
                    value: rulePair.delay,
                  },
                ],
              },
            },
          },
        },
      };
    }
  );
};

export default parseDelayRule;
