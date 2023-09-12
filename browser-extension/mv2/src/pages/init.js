document.documentElement.setAttribute("rq-ext-id", chrome.runtime.id);
document.documentElement.setAttribute("rq-ext-version", chrome.runtime.getManifest()["version"]);

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.action) {
    case RQ.EXTENSION_MESSAGES.SEND_EXTENSION_EVENTS:
      RQ.ContentScriptMessageHandler.sendMessage(message, (response) => {
        sendResponse(response);
      });
      return true;

    case RQ.EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED:
      RQ.ContentScriptMessageHandler.sendMessage(message, (response) => {
        sendResponse(response);
      });
      return true;

    case RQ.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED:
      RQ.ContentScriptMessageHandler.sendMessage(message);
      break;
  }
});
