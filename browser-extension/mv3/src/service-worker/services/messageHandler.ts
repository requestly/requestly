import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "common/constants";
import { checkIfNoRulesPresent, getRulesAndGroups } from "common/rulesStore";
import { initClientHandler } from "./clientHandler";
import { getAppTabs, isExtensionEnabled, toggleExtensionStatus } from "./utils";
import { getExecutedRules } from "./rulesManager";
import { applyScriptRules } from "./scriptRuleHandler";
import { getTabSession, initSessionRecording, onSessionRecordingStartedNotification } from "./sessionRecording";

// TODO: relay this message from content script to app, so UI could be updated immediately
export const sendMessageToApp = (messageObject: unknown, callback?: () => void) => {
  getAppTabs().then((tabs) => {
    tabs.forEach(({ id }) => {
      chrome.tabs.sendMessage(id, messageObject, callback);
    });
  });
};

export const initMessageHandler = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    /* From any case, return true when sendResponse is called asynchronously */
    switch (message.action) {
      case EXTENSION_MESSAGES.HANDSHAKE_CLIENT:
        initClientHandler({
          tabId: sender.tab?.id,
          frameIds: [sender.frameId],
        });
        applyScriptRules(sender.tab?.id, sender.frameId, sender.url);
        break;

      case CLIENT_MESSAGES.INIT_SESSION_RECORDING:
        initSessionRecording(sender.tab?.id, sender.frameId, sender.tab.url).then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.INIT_SESSION_RECORDING_WITH_NEW_CONFIG:
        initSessionRecording(sender.tab?.id, sender.frameId, sender.tab.url, true).then(sendResponse);
        return true;

      case CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STARTED:
        onSessionRecordingStartedNotification(sender.tab.id);
        break;

      case EXTENSION_MESSAGES.GET_TAB_SESSION:
        getTabSession(message.tabId, sendResponse);
        return true;

      case EXTENSION_MESSAGES.GET_RULES_AND_GROUPS:
        getRulesAndGroups().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.GET_EXECUTED_RULES:
        getExecutedRules(message.tabId).then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.CHECK_IF_NO_RULES_PRESENT:
        checkIfNoRulesPresent().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED:
        isExtensionEnabled().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS:
        toggleExtensionStatus().then(sendResponse);
        return true;
    }

    return false;
  });
};
