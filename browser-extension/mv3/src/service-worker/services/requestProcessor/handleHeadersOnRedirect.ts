import { AJAXRequestDetails, SessionRuleType } from "./types";
import { requestProcessor } from ".";

export const IGNORED_HEADERS_ON_REDIRECT = ["Authorization"];

export const forwardHeadersOnRedirect = async (tabId: number, requestDetails: AJAXRequestDetails) => {
  if (!IGNORED_HEADERS_ON_REDIRECT.some((header) => checkIfHeaderExists(requestDetails.requestHeaders, header))) {
    return;
  }

  const { matchedRule, matchedRuleInfo } = requestProcessor.findMatchingRule(
    [...requestProcessor.cachedRules.redirectRules, ...requestProcessor.cachedRules.replaceRules],
    requestDetails
  );

  if (!matchedRule) {
    return;
  }

  const ignoredHeaderValues = IGNORED_HEADERS_ON_REDIRECT.map((headerName) => {
    const headerKey = Object.keys(requestDetails.requestHeaders).find(
      (key) => key.toLowerCase() === headerName.toLowerCase()
    );
    return headerKey ? { name: headerKey, value: requestDetails.requestHeaders[headerKey] } : null;
  }).filter((headerObject) => headerObject !== null);

  const redirectedUrl = matchedRuleInfo.redirectedDestinationUrl;

  return requestProcessor.updateRequestSpecificRules(
    tabId,
    requestDetails.url,
    {
      action: {
        requestHeaders: ignoredHeaderValues.map((header: { name: string; value: string }) => ({
          header: header.name,
          value: header.value,
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
        })),
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      },
      condition: {
        // Exact URL is not used because for replace rules, a marker query param is added which changes the URL so exact URL doesn't match
        urlFilter: `|${redirectedUrl}`,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
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
