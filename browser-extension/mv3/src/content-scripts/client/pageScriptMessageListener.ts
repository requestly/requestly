import { EXTENSION_MESSAGES } from "common/constants";

export const initPageScriptMessageListener = () => {
  window.addEventListener("message", function (event) {
    if (event.source !== window || event.data.source !== "requestly:client") {
      return;
    }

    switch (event.data.action) {
      case "response_rule_applied":
      case "request_rule_applied":
        // tabId not populated from content script. Popuplate in service worker
        chrome.runtime.sendMessage({
          action: EXTENSION_MESSAGES.RULE_EXECUTED,
          rule: event.data.rule,
          requestDetails: event.data.requestDetails,
        });
        break;
    }
  });
};
