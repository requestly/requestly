import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "../../constants";
import { checkIfNoRulesPresent, getRulesAndGroups } from "../../rulesStore";
import { getAppTabs, getIsUserLoggedIn, toggleExtensionStatus } from "./utils";
import {
  cacheRecordedSessionOnClientPageUnload,
  getTabSession,
  handleSessionRecordingOnClientPageLoad,
  initSessionRecordingSDK,
  launchUrlAndStartRecording,
  onSessionRecordingStartedNotification,
  onSessionRecordingStoppedNotification,
  startRecordingExplicitly,
  stopRecording,
  watchRecording,
} from "./sessionRecording";
import { initCustomWidgets } from "./customWidgets";
import { getAPIResponse } from "./apiClient";
import { isExtensionEnabled } from "../../utils";

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
        isExtensionEnabled().then((isExtensionStatusEnabled) => {
          if (!isExtensionStatusEnabled) return;
          initCustomWidgets(sender.tab?.id, sender.frameId);
        });
        break;

      case EXTENSION_MESSAGES.CLIENT_PAGE_LOADED:
        handleSessionRecordingOnClientPageLoad(sender.tab, sender.frameId);
        break;

      case EXTENSION_MESSAGES.INIT_SESSION_RECORDER:
        initSessionRecordingSDK(sender.tab.id, sender.frameId).then(() => sendResponse());
        return true;

      case CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STARTED:
        onSessionRecordingStartedNotification(sender.tab.id, message.payload.markRecordingIcon);
        break;

      case CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STOPPED:
        onSessionRecordingStoppedNotification(sender.tab.id);
        break;

      case EXTENSION_MESSAGES.START_RECORDING_EXPLICITLY:
        startRecordingExplicitly(message.tab ?? sender.tab, message.showWidget);
        break;

      case EXTENSION_MESSAGES.START_RECORDING_ON_URL:
        launchUrlAndStartRecording(message.url);
        break;

      case EXTENSION_MESSAGES.STOP_RECORDING:
        stopRecording(message.tabId ?? sender.tab.id, message.openRecording);
        break;

      case EXTENSION_MESSAGES.GET_TAB_SESSION:
        getTabSession(message.tabId, sendResponse);
        return true;

      case EXTENSION_MESSAGES.GET_RULES_AND_GROUPS:
        getRulesAndGroups().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.GET_API_RESPONSE:
        getAPIResponse(message.apiRequest).then(sendResponse);
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

      case EXTENSION_MESSAGES.WATCH_RECORDING:
        watchRecording(message.tabId ?? sender.tab?.id);
        break;

      case EXTENSION_MESSAGES.GET_IS_USER_LOGGED_IN:
        getIsUserLoggedIn().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.CACHE_RECORDED_SESSION_ON_PAGE_UNLOAD:
        cacheRecordedSessionOnClientPageUnload(sender.tab.id, message.payload);
        break;
    }

    return false;
  });
};
