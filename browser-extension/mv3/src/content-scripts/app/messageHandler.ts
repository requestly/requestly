import config from "common/config";
import { APP_MESSAGES, EXTENSION_MESSAGES, STORAGE_TYPE } from "common/constants";
import { clearAllRecords, getAllRecords, getRecord, getSuperObject, removeRecord, saveObject } from "common/storage";
import { isAppURL } from "../../utils";

interface ContentScriptMessage {
  action: string;
  requestId?: number;
  [key: string]: unknown;
}

type MessageCallback = (args: unknown) => void;

const eventCallbackMap: Record<string, MessageCallback> = {};
let requestId = 1;

const constants = {
  CONTENT_SCRIPT: "content_script",
  PAGE_SCRIPT: "page_script",
  SOURCE_FIELD: "source",
  ACTION_USER_LOGGED_IN: "user:loggedIn",
};

const registerCallback = (message: ContentScriptMessage, callback: MessageCallback): void => {
  if (!callback) return;

  // Message has requestId when we are sending response
  const requestIdToUse = requestId;
  eventCallbackMap[message.action + "_" + requestIdToUse] = callback;
  message.requestId = requestIdToUse;
};

const invokeCallback = (event: MessageEvent): void => {
  const callbackRef = eventCallbackMap[event.data.action + "_" + event.data.requestId];

  if (typeof callbackRef === "function") {
    // We should remove the entry from map first before executing the callback otherwise we will store stale references of functions
    delete eventCallbackMap[event.data.action];
    callbackRef(event.data.response);
  }
};

const delegateMessageToBackground = (message: ContentScriptMessage): void => {
  chrome.runtime.sendMessage(message, (bgResponse) => {
    sendResponse(message, bgResponse);
  });
};

export const sendExtensionMessage = (message: ContentScriptMessage, callback?: MessageCallback): void => {
  if (!message.action) {
    return;
  }

  if (callback) {
    registerCallback(message, callback);
  }

  message[constants.SOURCE_FIELD] = constants.CONTENT_SCRIPT;
  window.postMessage(message, window.origin);
};

const sendResponse = (originalEventData: ContentScriptMessage, response?: unknown): void => {
  sendExtensionMessage({
    action: originalEventData.action,
    requestId: originalEventData.requestId,
    response,
  });
};

export const initMessageHandler = () => {
  window.addEventListener(
    "message",
    async (event: MessageEvent): Promise<void> => {
      if (event && !isAppURL(event.origin)) {
        if (config.logLevel === "debug") {
          console.log("Ignoring message from the following domain", event.origin, event.data);
        }
        return;
      }

      if (event && event.data && event.data.source === constants.PAGE_SCRIPT) {
        config.logLevel === "debug" && console.log("Received message:", event.data);

        // Check whether it is a response to invoke callback or a request to perform an action
        if (typeof event.data.response !== "undefined") {
          invokeCallback(event);
        }

        switch (event.data.action) {
          case APP_MESSAGES.GET_STORAGE_INFO: {
            const records = await getAllRecords();
            sendResponse(event.data, {
              storageType: STORAGE_TYPE,
              numItems: records.length,
              bytesUsed: JSON.stringify(records).length,
            });
            return;
          }
          case APP_MESSAGES.GET_STORAGE_SUPER_OBJECT: {
            const superObject = await getSuperObject();
            sendResponse(event.data, superObject);
            return;
          }
          case APP_MESSAGES.GET_STORAGE_OBJECT: {
            const obj = await getRecord(event.data.key);
            sendResponse(event.data, obj);
            return;
          }
          case APP_MESSAGES.SAVE_STORAGE_OBJECT: {
            await saveObject(event.data.object);
            sendResponse(event.data);
            return;
          }
          case APP_MESSAGES.REMOVE_STORAGE_OBJECT: {
            await removeRecord(event.data.key);
            sendResponse(event.data);
            return;
          }
          case APP_MESSAGES.CLEAR_STORAGE: {
            await clearAllRecords();
            sendResponse(event.data);
            return;
          }
          case EXTENSION_MESSAGES.GET_TAB_SESSION:
            delegateMessageToBackground(event.data);
        }
      }
    }
  );
};
