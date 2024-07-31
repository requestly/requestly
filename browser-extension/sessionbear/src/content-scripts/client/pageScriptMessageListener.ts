import { CLIENT_MESSAGES, CLIENT_SOURCE, EXTENSION_MESSAGES } from "../../constants";

export const initPageScriptMessageListener = () => {
  window.addEventListener("message", function (event) {
    if (event.source !== window || event.data.source !== CLIENT_SOURCE.SESSIONBEAR) {
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
      case EXTENSION_MESSAGES.ON_BEFORE_AJAX_REQUEST:
        chrome.runtime.sendMessage(event.data, () => {
          window.postMessage(
            {
              source: CLIENT_SOURCE.SESSIONBEAR,
              action: CLIENT_MESSAGES.ON_BEFORE_AJAX_REQUEST_PROCESSED,
            },
            window.location.href
          );
        });
        break;
      case EXTENSION_MESSAGES.ON_ERROR_OCCURRED:
        chrome.runtime.sendMessage(event.data, () => {
          window.postMessage(
            {
              source: CLIENT_SOURCE.SESSIONBEAR,
              action: CLIENT_MESSAGES.ON_ERROR_OCCURRED_PROCESSED,
            },
            window.location.href
          );
        });
        break;
    }
  });
};
