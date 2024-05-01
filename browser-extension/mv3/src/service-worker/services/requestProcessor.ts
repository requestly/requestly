import { CLIENT_MESSAGES } from "common/constants";
import { updateSessionRules } from "./rulesManager";
import { TAB_SERVICE_DATA, tabService } from "./tabService";

interface RequestDetails {
  tabId: number;
  url: string;
  method: string;
  type: "xmlhttprequest" | "fetch";
  timestamp: number;
}

interface ActionDetails {
  type: ActionType;
  ignoredHeaders?: { name: string; value: string }[];
  destinationUrl?: string;
}

enum ActionType {
  FORWARD_IGNORED_HEADERS = "forward_ignored_headers",
}

export const processRequest = async (requestDetails: RequestDetails, actionDetails: ActionDetails) => {
  try {
    switch (actionDetails.type) {
      case ActionType.FORWARD_IGNORED_HEADERS:
        console.log("!!!debug", "forward::", { requestDetails, actionDetails });
        await forwardIgnoredHeaders(requestDetails, actionDetails).then(() => {
          chrome.declarativeNetRequest.getSessionRules().then((rules) => {
            console.log("!!!debug", "sessionRules rules", rules);
          });
        });
        break;
    }
  } catch (e) {
    console.log("!!!debug", "error in sw", e);
  } finally {
    notifyRequestProcessedToTab(requestDetails.tabId);
  }
};

const forwardIgnoredHeaders = async (requestDetails: RequestDetails, actionDetails: ActionDetails) => {
  return updateRequestSpecificRules(requestDetails.tabId, requestDetails.url, {
    action: {
      requestHeaders: actionDetails.ignoredHeaders.map((header: { name: string; value: string }) => ({
        header: header.name,
        value: header.value,
        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      })),
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
    },
    condition: {
      urlFilter: `|${actionDetails.destinationUrl}`,
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
      tabIds: [requestDetails.tabId],
      requestMethods: [requestDetails.method.toLowerCase() as chrome.declarativeNetRequest.RequestMethod],
    },
  });
};

const updateRequestSpecificRules = async (
  tabId: number,
  requestUrl: string,
  ruleDetails: {
    action: chrome.declarativeNetRequest.RuleAction;
    condition: chrome.declarativeNetRequest.RuleCondition;
  }
) => {
  let ruleId = parseInt(`${Date.now() % 1000000}${Math.floor(Math.random() * 1000)}`);
  console.log("!!!debug", "ruleID", ruleId);
  const sessionRulesMap = tabService.getData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP);
  let removeRuleIds = [];
  if (sessionRulesMap?.[requestUrl]) {
    ruleId = sessionRulesMap[requestUrl];
    removeRuleIds.push(ruleId);
  }

  tabService.setData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP, {
    ...sessionRulesMap,
    [requestUrl]: ruleId,
  });

  return updateSessionRules({
    addRules: [
      {
        id: ruleId,
        ...ruleDetails,
      },
    ],
    removeRuleIds,
  });
};

const notifyRequestProcessedToTab = (tabId: number) => {
  chrome.tabs.sendMessage(tabId, {
    action: CLIENT_MESSAGES.NOTIFY_REQUEST_PROCESSED,
  });
};
