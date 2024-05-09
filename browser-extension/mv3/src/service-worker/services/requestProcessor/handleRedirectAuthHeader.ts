import { IGNORED_HEADERS_ON_REDIRECT } from "common/constants";
import { AJAXRequestDetails } from "./types";
import { requestProcessor } from ".";

export const forwardAuthHeaderOnRedirect = async (tabId: number, requestDetails: AJAXRequestDetails) => {
  if (
    !IGNORED_HEADERS_ON_REDIRECT.some(
      (header) => requestDetails.requestHeaders[header] || requestDetails.requestHeaders[header.toLowerCase()]
    )
  ) {
    return;
  }

  const matchedRule = requestProcessor.findMatchingRule(
    [...requestProcessor.cachedRules.redirectRules, ...requestProcessor.cachedRules.replaceRules],
    requestDetails
  );

  if (!matchedRule) {
    return;
  }

  const ignoredHeaderValues = IGNORED_HEADERS_ON_REDIRECT.map((header) => ({
    name: header,
    value: requestDetails.requestHeaders[header] || requestDetails.requestHeaders[header.toLowerCase()],
  }));

  const redirectedUrl = requestProcessor.getRedirectedUrl(matchedRule, requestDetails);

  return requestProcessor.updateRequestSpecificRules(tabId, requestDetails.url, {
    action: {
      requestHeaders: ignoredHeaderValues.map((header: { name: string; value: string }) => ({
        header: header.name,
        value: header.value,
        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      })),
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
    },
    condition: {
      // Exact URL is not used because for replace rules, a marker query param is add which changes the URL so exact URL doesn't match
      urlFilter: `|${redirectedUrl}`,
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
      tabIds: [tabId],
      requestMethods: [requestDetails.method.toLowerCase() as chrome.declarativeNetRequest.RequestMethod],
      excludedInitiatorDomains: ["requestly.io", "requestly.com"],
    },
  });
};
