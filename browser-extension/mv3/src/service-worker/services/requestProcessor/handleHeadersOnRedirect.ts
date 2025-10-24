import { AJAXRequestDetails, SessionRuleType } from "./types";
import { findMatchingRule } from "../../../common/ruleMatcher";
import { updateRequestSpecificRules } from "../rulesManager";
import { Rule } from "common/types";

export const IGNORED_HEADERS_ON_REDIRECT = ["Authorization"];

export const forwardHeadersOnRedirect = async (tabId: number, requestDetails: AJAXRequestDetails, rules: Rule[]) => {
  if (!IGNORED_HEADERS_ON_REDIRECT.some((header) => checkIfHeaderExists(requestDetails.requestHeaders, header))) {
    return;
  }

  const { isApplied, destinationUrl } = findMatchingRule(rules, requestDetails) ?? {};

  if (!isApplied) {
    return;
  }

  const ignoredHeaderValues = IGNORED_HEADERS_ON_REDIRECT.map((headerName) => {
    const headerKey = Object.keys(requestDetails.requestHeaders).find(
      (key) => key.toLowerCase() === headerName.toLowerCase()
    );
    return headerKey ? { name: headerKey, value: requestDetails.requestHeaders[headerKey] } : null;
  }).filter((headerObject) => headerObject !== null);

  const redirectedUrl = destinationUrl;

  return updateRequestSpecificRules(
    tabId,
    requestDetails.url,
    {
      action: {
        requestHeaders: ignoredHeaderValues.map((header: { name: string; value: string }) => ({
          header: header.name,
          value: header.value,
          operation: "set" as chrome.declarativeNetRequest.HeaderOperation,
        })),
        type: "modifyHeaders" as chrome.declarativeNetRequest.RuleActionType,
      },
      condition: {
        // Exact URL is not used because for replace rules, a marker query param is added which changes the URL so exact URL doesn't match
        urlFilter: `|${redirectedUrl}`,
        resourceTypes: ["xmlhttprequest" as chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
        tabIds: [tabId],
        requestMethods: [requestDetails.method.toLowerCase() as chrome.declarativeNetRequest.RequestMethod],
        excludedInitiatorDomains: ["requestly.io", "requestly.com"],
      },
    },
    SessionRuleType.FORWARD_IGNORED_HEADERS
  );
};

const checkIfHeaderExists = (requestHeaders: AJAXRequestDetails["requestHeaders"], header: string) => {
  return Object.keys(requestHeaders).some((key) => key.toLowerCase() === header.toLowerCase());
};
