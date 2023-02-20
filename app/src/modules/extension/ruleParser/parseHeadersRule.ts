import {
  HeadersRule,
  HeaderRuleActionType,
  HeadersRuleModificationData,
} from "../../../types/rules";
import {
  ExtensionRule,
  ExtensionRuleAction,
  HeadersRuleOperation,
  ModifyHeaderInfo,
  RuleActionType,
} from "../types";
import { parseConditionFromSource } from "./utils";

const parseHeaders = (
  headers: HeadersRuleModificationData[]
): ModifyHeaderInfo[] => {
  return headers.map((header) => {
    if (header.type === HeaderRuleActionType.REMOVE) {
      return {
        header: header.header,
        operation: "remove" as HeadersRuleOperation,
      };
    } else {
      return {
        header: header.header,
        value: header.value,
        operation: "set" as HeadersRuleOperation,
      };
    }
  });
};

const parseHeadersRule = (rule: HeadersRule): ExtensionRule[] => {
  return rule.pairs.map(
    (rulePair): ExtensionRule => {
      const condition = parseConditionFromSource(rulePair.source);
      const action: ExtensionRuleAction = {
        type: RuleActionType.MODIFY_HEADERS,
      };

      if (rulePair.modifications?.Request?.length) {
        action.requestHeaders = parseHeaders(rulePair.modifications?.Request);
      }

      if (rulePair.modifications?.Response?.length) {
        action.responseHeaders = parseHeaders(rulePair.modifications?.Response);
      }

      return { action, condition };
    }
  );
};

export default parseHeadersRule;
