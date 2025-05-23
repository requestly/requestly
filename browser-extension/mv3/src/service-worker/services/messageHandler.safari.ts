import { EXTENSION_MESSAGES } from "common/constants";
import { updateExtensionStatus } from "./utils";
import { getAPIResponse } from "./apiClient";
import { isExtensionEnabled, isUrlInBlockList } from "../../utils";

export const initMessageHandler = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    /* From any case, return true when sendResponse is called asynchronously */
    switch (message.action) {
      case EXTENSION_MESSAGES.GET_API_RESPONSE:
        getAPIResponse(message.apiRequest).then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED:
        isExtensionEnabled().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS:
        updateExtensionStatus(message.newStatus)
          .then((updatedStatus) => {
            sendResponse({
              success: true,
              updatedStatus,
            });
          })
          .catch((e) => {
            sendResponse({
              success: false,
            });
            console.log(
              "[messageHandler.handleToggleExtensionStatus] Error occurred while updating extension status.",
              {
                error: e.message,
              }
            );
          });
        return true;

      case EXTENSION_MESSAGES.IS_EXTENSION_BLOCKED_ON_TAB: {
        if (!message.tabUrl) {
          sendResponse(false);
          break;
        }

        isUrlInBlockList(message.tabUrl)
          .then((isBlocked) => sendResponse(isBlocked))
          .catch(() => sendResponse(false));

        return true;
      }
    }

    return false;
  });
};
