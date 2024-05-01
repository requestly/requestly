import { CLIENT_MESSAGES } from "common/constants";
import { updateSessionRules } from "./rulesManager";
import { TAB_SERVICE_DATA, tabService } from "./tabService";

export const processRequest = async (requestDetails, actionDetails) => {
  try {
    switch (actionDetails.type) {
      case "forward_ignored_headers":
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

const forwardIgnoredHeaders = async (requestDetails, actionDetails) => {
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
      requestMethods: [requestDetails.method.toLowerCase()],
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
  let ruleId = Date.now() % 10000000;
  console.log("!!!debug", "ruleID", ruleId);
  const sessionRulesMap = tabService.getData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP);
  let removeId = [];
  if (sessionRulesMap?.[requestUrl]) {
    ruleId = sessionRulesMap[requestUrl];
    removeId.push(ruleId);
  }

  return updateSessionRules({
    addRules: [
      {
        id: ruleId,
        ...ruleDetails,
      },
    ],
    removeRuleIds: removeId,
  }).then(() => {
    tabService.setData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP, {
      ...sessionRulesMap,
      [requestUrl]: ruleId,
    });
  });
};

const notifyRequestProcessedToTab = (tabId: number) => {
  chrome.tabs.sendMessage(tabId, {
    action: CLIENT_MESSAGES.NOTIFY_REQUEST_PROCESSED,
  });
};
