import { UserAgentRule } from "@requestly/shared/types/entities/rules";
import { ExtensionRule, ExtensionRuleAction, HeadersRuleOperation, RuleActionType } from "../types";
import { parseConditionFromSource } from "./utils";

const USER_AGENT_HEADER = "User-Agent";

const parseUserAgentRule = (rule: UserAgentRule.Record): ExtensionRule[] => {
  return rule.pairs.map(
    (rulePair): ExtensionRule => {
      const condition = parseConditionFromSource(rulePair.source);
      const action: ExtensionRuleAction = {
        type: RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
          {
            header: USER_AGENT_HEADER,
            value: rulePair.userAgent,
            operation: "set" as HeadersRuleOperation,
          },
        ],
      };

      return { action, condition };
    }
  );
};

export default parseUserAgentRule;
