import { CLIENT_MESSAGES, EXTENSION_EXTERNAL_MESSAGES, EXTENSION_MESSAGES } from "common/constants";
import { checkIfNoRulesPresent, getRulesAndGroups } from "common/rulesStore";
import { applyScriptRules } from "../scriptRuleHandler";
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
} from "../sessionRecording";
import { initCustomWidgets } from "../customWidgets";
import { getAPIResponse } from "../apiClient";
import { requestProcessor } from "../requestProcessor";
import {
  handleTestRuleOnClientPageLoad,
  launchUrlAndStartRuleTesting,
  saveTestRuleResult,
} from "../testThisRuleHandler";
import ruleExecutionHandler from "../ruleExecutionHandler";
import { getPopupConfig, isExtensionEnabled, isUrlInBlockList } from "../../../utils";
import { globalStateManager } from "../globalStateManager";
import { isProxyApplied } from "../proxy";
import {
  connectToDesktopAppAndApplyProxy,
  disconnectFromDesktopAppAndRemoveProxy,
  checkIfDesktopAppOpen,
} from "../desktopApp/index";
import { sendMessageToApp } from "./sender";
import { triggerOpenCurlModalMessage, updateExtensionStatus } from "../utils";
import extensionIconManager from "../extensionIconManager";

export const initExternalMessageListener = () => {
  chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case EXTENSION_EXTERNAL_MESSAGES.GET_EXTENSION_METADATA:
        sendResponse({
          name: chrome.runtime.getManifest().name,
          version: chrome.runtime.getManifest().version,
        });
        break;
    }
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
          applyScriptRules(sender.tab?.id, sender.frameId, sender.url, sender.tab?.url);
        });
        break;

      case EXTENSION_MESSAGES.CLIENT_PAGE_LOADED:
        ruleExecutionHandler.processTabCachedRulesExecutions(sender.tab.id);
        handleTestRuleOnClientPageLoad(sender.tab);
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

      case EXTENSION_MESSAGES.GET_EXECUTED_RULES:
        ruleExecutionHandler.getExecutedRules(message.tabId ?? sender.tab.id).then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.CHECK_IF_NO_RULES_PRESENT:
        checkIfNoRulesPresent().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED:
        isExtensionEnabled().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS:
        console.log(`[Toggle extension status] message received`, {
          message,
        });
        updateExtensionStatus(message.newStatus)
          .then((updatedStatus) => {
            const response = {
              success: true,
              updatedStatus,
            };
            sendResponse(response);
            console.log(`[Toggle extension status] response sent`, {
              ...response,
              extensionIconState: extensionIconManager.getState(),
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
                extensionIconState: extensionIconManager.getState(),
                message,
              }
            );
          });
        return true;

      case EXTENSION_MESSAGES.WATCH_RECORDING:
        watchRecording(message.tabId ?? sender.tab?.id);
        break;

      case EXTENSION_MESSAGES.CACHE_RECORDED_SESSION_ON_PAGE_UNLOAD:
        cacheRecordedSessionOnClientPageUnload(sender.tab.id, message.payload);
        break;

      case EXTENSION_MESSAGES.ON_BEFORE_AJAX_REQUEST:
        requestProcessor.onBeforeAJAXRequest(sender.tab.id, message.requestDetails).then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.ON_ERROR_OCCURRED:
        requestProcessor.onErrorOccurred(sender.tab.id, message.requestDetails).then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.TEST_RULE_ON_URL:
        launchUrlAndStartRuleTesting(message, sender.tab.id);
        break;

      case EXTENSION_MESSAGES.SAVE_TEST_RULE_RESULT:
        saveTestRuleResult(message, sender.tab);
        break;

      case EXTENSION_MESSAGES.RULE_EXECUTED:
        const requestDetails = { ...message.requestDetails, tabId: message.requestDetails?.tabId || sender.tab?.id };
        ruleExecutionHandler.onRuleExecuted(message.rule, requestDetails);
        break;

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

      case EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED_IN_POPUP:
        sendMessageToApp({ action: CLIENT_MESSAGES.NOTIFY_RECORD_UPDATED, payload: message?.payload });
        break;

      case EXTENSION_MESSAGES.CACHE_SHARED_STATE:
        globalStateManager.updateSharedStateInStorage(sender.tab.id, message.sharedState);
        break;

      case EXTENSION_MESSAGES.CONNECT_TO_DESKTOP_APP:
        connectToDesktopAppAndApplyProxy()
          .then(sendResponse)
          .catch(() => sendResponse(false));
        return true;

      case EXTENSION_MESSAGES.DISCONNECT_FROM_DESKTOP_APP:
        disconnectFromDesktopAppAndRemoveProxy()
          .then(sendResponse)
          .catch(() => sendResponse(false));
        return true;

      case EXTENSION_MESSAGES.IS_PROXY_APPLIED:
        isProxyApplied().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.CHECK_IF_DESKTOP_APP_OPEN:
        checkIfDesktopAppOpen().then(sendResponse);
        return true;

      case EXTENSION_MESSAGES.IS_SESSION_REPLAY_ENABLED:
        getPopupConfig()
          .then((config) => {
            sendResponse(config?.session_replay === true);
          })
          .catch(() => {
            sendResponse(false);
          });
        return true;

      case EXTENSION_MESSAGES.TRIGGER_OPEN_CURL_MODAL:
        triggerOpenCurlModalMessage({}, message.source);
        break;
    }

    return false;
  });
};
