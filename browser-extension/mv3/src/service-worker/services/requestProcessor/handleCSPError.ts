import { AJAXRequestDetails, SessionRuleType } from "./types";
import { updateRequestSpecificRules } from "../rulesManager";

export const handleCSPError = async (tabId: number, requestDetails: AJAXRequestDetails): Promise<void> => {
  await updateRequestSpecificRules(
    tabId,
    requestDetails.initiatorDomain,
    {
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        responseHeaders: [
          {
            header: "Content-Security-Policy",
            operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          },
        ],
      },
      condition: {
        urlFilter: requestDetails.initiatorDomain,
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
        ],
        tabIds: [tabId],
        excludedInitiatorDomains: ["requestly.io", "requestly.com"],
      },
    },
    SessionRuleType.CSP_ERROR
  );
};
