import { AJAXRequestDetails, SessionRuleType } from "./types";
import { updateRequestSpecificRules } from "../rulesManager";

export const handleCSPError = async (tabId: number, requestDetails: AJAXRequestDetails): Promise<void> => {
  await updateRequestSpecificRules(
    tabId,
    requestDetails.initiator,
    {
      action: {
        type: "modifyHeaders" as chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        responseHeaders: [
          {
            header: "Content-Security-Policy",
            operation: "remove" as chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          },
        ],
      },
      condition: {
        urlFilter: requestDetails.initiator,
        resourceTypes: [
          "sub_frame" as chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
          "main_frame" as chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
        ],
        tabIds: [tabId],
        excludedInitiatorDomains: ["requestly.io", "requestly.com"],
      },
    },
    SessionRuleType.CSP_ERROR
  );
};
