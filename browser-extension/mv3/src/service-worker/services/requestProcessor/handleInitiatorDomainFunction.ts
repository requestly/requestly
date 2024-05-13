import { Rule } from "common/types";
import { findMatchingRule } from "../ruleMatcher";
import { updateRequestSpecificRules } from "../rulesManager";
import { AJAXRequestDetails, SessionRuleType } from "./types";

const INITIATOR_DOMAIN_FUNCTION = "rq_request_initiator_origin()";

export const handleInitiatorDomainFunction = async (
  tabId: number,
  requestDetails: AJAXRequestDetails,
  rules: Rule[]
) => {
  const { isApplied, matchedPair } = findMatchingRule(rules, requestDetails) ?? {};

  if (!isApplied) {
    return;
  }

  const headerKeyValueMap: Record<"Response" | "Request", Record<string, string>> = {
    Request: {},
    Response: {},
  };

  if (matchedPair.modifications?.Request?.length) {
    matchedPair.modifications.Request.forEach((header: { header: string; type: string; value: string }) => {
      if (header.value === INITIATOR_DOMAIN_FUNCTION) {
        headerKeyValueMap.Request[header.header] = requestDetails.initiatorDomain;
      }
    });
  }

  if (matchedPair.modifications?.Response?.length) {
    matchedPair.modifications.Response.forEach((header: { header: string; type: string; value: string }) => {
      if (header.value === INITIATOR_DOMAIN_FUNCTION) {
        headerKeyValueMap.Response[header.header] = requestDetails.initiatorDomain;
      }
    });
  }

  const ruleAction: {
    requestHeaders?: chrome.declarativeNetRequest.RuleAction["requestHeaders"];
    responseHeaders?: chrome.declarativeNetRequest.RuleAction["responseHeaders"];
  } = {};

  if (Object.keys(headerKeyValueMap.Request).length) {
    ruleAction.requestHeaders = Object.entries(headerKeyValueMap.Request).map(([header, value]) => ({
      header,
      value,
      operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    }));
  }

  if (Object.keys(headerKeyValueMap.Response).length) {
    ruleAction.responseHeaders = Object.entries(headerKeyValueMap.Response).map(([header, value]) => ({
      header,
      value,
      operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    }));
  }

  if (!Object.keys(ruleAction).length) {
    return;
  }

  await updateRequestSpecificRules(
    tabId,
    requestDetails.url,
    {
      action: {
        ...ruleAction,
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      },
      condition: {
        urlFilter: `|${requestDetails.url}|`,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
        tabIds: [tabId],
        requestMethods: [requestDetails.method.toLowerCase() as chrome.declarativeNetRequest.RequestMethod],
        excludedInitiatorDomains: ["requestly.io", "requestly.com"],
      },
    },
    SessionRuleType.INITIATOR_DOMAIN
  );
};
