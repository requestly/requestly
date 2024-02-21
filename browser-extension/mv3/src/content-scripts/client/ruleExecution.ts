import { CLIENT_MESSAGES } from "common/constants";

export const initRuleExecutionHandler = () => {
  const appliedRequestResponseRuleIds = new Set<string>();
  const appliedScriptRuleIds = new Set<string>();

  window.addEventListener("message", function (event) {
    if (event.source !== window || event.data.source !== "requestly:client") {
      return;
    }

    switch (event.data.action) {
      case "response_rule_applied":
      case "request_rule_applied":
        appliedRequestResponseRuleIds.add(event.data.ruleId);
        break;
    }
  });

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.GET_APPLIED_REQUEST_RESPONSE_RULES:
        sendResponse(Array.from(appliedRequestResponseRuleIds));
        break;
      case CLIENT_MESSAGES.UPDATE_APPLIED_SCRIPT_RULES:
        message.ruleIds.forEach((ruleId: string) => appliedScriptRuleIds.add(ruleId));
        break;
      case CLIENT_MESSAGES.GET_APPLIED_SCRIPT_RULES:
        sendResponse(Array.from(appliedScriptRuleIds));
        break;
    }
    return false;
  });
};
