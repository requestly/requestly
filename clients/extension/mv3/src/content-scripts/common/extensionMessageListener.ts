import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "common/constants";
import { sendExtensionMessage } from "../app/messageHandler";

/**
 * Initializes the extension message listener to handle communication between the extension and client page.
 * Listens for specific messages from the extension and forwards them to the client page using sendExtensionMessage.
 */

export const initExtensionMessageListener = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case EXTENSION_MESSAGES.CLIENT_PAGE_LOADED:
        chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CLIENT_PAGE_LOADED });
        break;

      case EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED:
      case CLIENT_MESSAGES.NOTIFY_RECORD_UPDATED:
      case EXTENSION_MESSAGES.RULE_SAVE_ERROR:
      case EXTENSION_MESSAGES.DESKTOP_APP_CONNECTION_STATUS_UPDATED:
      case CLIENT_MESSAGES.NOTIFY_EXTENSION_STATUS_UPDATED:
      case CLIENT_MESSAGES.OPEN_CURL_IMPORT_MODAL:
        sendExtensionMessage(message);
        break;
    }
  });
};
