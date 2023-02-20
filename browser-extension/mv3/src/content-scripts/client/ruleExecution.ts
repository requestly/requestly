import { CLIENT_MESSAGES } from "common/constants";

export const initRuleExecutionHandler = () => {
  const appliedResponseRuleIds = new Set<string>();
  const appliedScriptRuleIds = new Set<string>();

  window.addEventListener("message", function (event) {
    if (event.source !== window || event.data.source !== "requestly:client") {
      return;
    }

    if (event.data.action === "response_rule_applied") {
      appliedResponseRuleIds.add(event.data.ruleId);
    }
  });

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.GET_APPLIED_RESPONSE_RULES:
        sendResponse(Array.from(appliedResponseRuleIds));
        break;
      case CLIENT_MESSAGES.UPDATE_APPLIED_SCRIPT_RULES:
        message.ruleIds.forEach((ruleId: string) =>
          appliedScriptRuleIds.add(ruleId)
        );
        break;
      case CLIENT_MESSAGES.GET_APPLIED_SCRIPT_RULES:
        sendResponse(Array.from(appliedScriptRuleIds));
        break;
    }
    return false;
  });
};
