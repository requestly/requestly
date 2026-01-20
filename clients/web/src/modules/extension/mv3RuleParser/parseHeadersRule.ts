import { HeaderRule } from "@requestly/shared/types/entities/rules";
import { ExtensionRule, ExtensionRuleAction, HeadersRuleOperation, ModifyHeaderInfo, RuleActionType } from "../types";
import { parseConditionFromSource } from "./utils";

const APPEND_SUPPORTED_HEADERS = [
  "accept",
  "accept-encoding",
  "accept-language",
  "access-control-request-headers",
  "cache-control",
  "connection",
  "content-language",
  "cookie",
  "forwarded",
  "if-match",
  "if-none-match",
  "keep-alive",
  "range",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via",
  "want-digest",
  "x-forwarded-for",
];

const parseHeaders = (headers: HeaderRule.Modification[], headerType: "Request" | "Response"): ModifyHeaderInfo[] => {
  return headers
    .map((header) => {
      if (header.value === "rq_request_initiator_origin()") {
        return null;
      }

      if (header.type === HeaderRule.ModificationType.REMOVE) {
        return {
          header: header.header,
          operation: "remove" as HeadersRuleOperation,
        };
      } else if (
        header.type === HeaderRule.ModificationType.ADD &&
        (headerType === "Response" ||
          (headerType === "Request" && APPEND_SUPPORTED_HEADERS.includes(header.header.toLowerCase()))) // Append is supported only for specific request headers
      ) {
        return {
          header: header.header.toLowerCase(),
          value: header.value,
          operation: "append" as HeadersRuleOperation,
        };
      } else {
        return {
          header: header.header,
          value: header.value,
          operation: "set" as HeadersRuleOperation,
        };
      }
    })
    .filter(Boolean);
};

const parseHeadersRule = (rule: HeaderRule.Record): ExtensionRule[] => {
  return rule.pairs
    .map(
      (rulePair): ExtensionRule => {
        const condition = parseConditionFromSource(rulePair.source);
        const action: ExtensionRuleAction = {
          type: RuleActionType.MODIFY_HEADERS,
        };

        if (rulePair.modifications?.Request?.length) {
          action.requestHeaders = parseHeaders(rulePair.modifications?.Request, "Request");
        }

        if (rulePair.modifications?.Response?.length) {
          action.responseHeaders = parseHeaders(rulePair.modifications?.Response, "Response");
        }

        if (!(action.requestHeaders?.length || action.responseHeaders?.length)) {
          return null;
        }

        return { action, condition };
      }
    )
    .filter(Boolean);
};

export default parseHeadersRule;
