import { DelayRule } from "@requestly/shared/types/entities/rules";
import { ExtensionResourceType, ExtensionRule, RuleActionType } from "../types";
import { parseConditionFromSource } from "./utils";

const parseDelayRule = (rule: DelayRule.Record): ExtensionRule[] => {
  return rule.pairs.map(
    (rulePair): ExtensionRule => {
      return {
        priority: 1,
        condition: {
          ...parseConditionFromSource(rulePair.source),
          excludedResourceTypes: ["xmlhttprequest" as ExtensionResourceType],
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
