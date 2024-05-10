export const handlePredefinedFunctions = async (tabId: number, requestDetails: AJAXRequestDetails) => {
  const matchedRule = this.findMatchingRule(this.cachedRules.headerRules, requestDetails.url);

  if (!matchedRule) {
    return;
  }

  const headerKeyValueMap: Record<"Response" | "Request", Record<string, string>> = {
    Request: {},
    Response: {},
  };

  matchedRule.pairs.forEach((pair) => {
    if (matchSourceUrl(pair.source, requestDetails.url)) {
      if (pair.modifications?.Request?.length) {
        pair.modifications.Request.forEach((header: { header: string; type: string; value: string }) => {
          if (header.value === "rq_request_initiator_origin()") {
            headerKeyValueMap.Request[header.header] = requestDetails.initiatorDomain;
          }
        });
      }

      if (pair.modifications?.Response?.length) {
        pair.modifications.Response.forEach((header: { header: string; type: string; value: string }) => {
          if (header.value === "rq_request_initiator_origin()") {
            headerKeyValueMap.Response[header.header] = requestDetails.initiatorDomain;
          }
        });
      }
    }
  });

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

  await this.updateRequestSpecificRules(tabId, requestDetails.url, {
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
  });
};
