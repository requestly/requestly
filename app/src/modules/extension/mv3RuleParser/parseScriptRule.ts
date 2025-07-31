import { ScriptRule } from "@requestly/shared/types/entities/rules";
import {
  ExtensionResourceType,
  ExtensionRule,
  ExtensionRuleAction,
  HeadersRuleOperation,
  RuleActionType,
} from "../types";
import { parseConditionFromSource } from "./utils";

const CSP_HEADER = "Content-Security-Policy";

// Only need to add headers rule to remove the CSP header
const parseScriptRule = (rule: ScriptRule.Record): ExtensionRule[] => {
  if (rule.removeCSPHeader === false) {
    return [];
  }

  return rule.pairs.map(
    (rulePair): ExtensionRule => {
      const condition = parseConditionFromSource(rulePair.source);
      const action: ExtensionRuleAction = {
        type: RuleActionType.MODIFY_HEADERS,
        responseHeaders: [
          {
            header: CSP_HEADER,
            operation: "remove" as HeadersRuleOperation,
          },
        ],
      };

      condition.resourceTypes = ["main_frame" as ExtensionResourceType, "sub_frame" as ExtensionResourceType];

      return { action, condition };
    }
  );
};

export default parseScriptRule;
