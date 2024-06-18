import { EXTENSION_MESSAGES } from "common/constants";
import { sendExtensionMessage } from "../app/messageHandler";

export const initExtensionMessageListener = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED:
        sendExtensionMessage(message);
        break;

      case EXTENSION_MESSAGES.CLIENT_PAGE_LOADED:
        chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CLIENT_PAGE_LOADED });
        break;

      case EXTENSION_MESSAGES.RULE_SAVE_ERROR:
        sendExtensionMessage(message);
        break;
    }
  });
};
