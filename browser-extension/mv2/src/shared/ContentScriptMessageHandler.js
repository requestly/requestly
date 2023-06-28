window.RQ = window.RQ || {};

RQ.ContentScriptMessageHandler = {
  eventCallbackMap: {},
  requestId: 1,

  constants: {
    CONTENT_SCRIPT: "content_script",
    PAGE_SCRIPT: "page_script",
    SOURCE_FIELD: "source",
    ACTION_USER_LOGGED_IN: "user:loggedIn",
  },

  addMessageListener: function () {
    window.addEventListener("message", this.handleMessageReceived.bind(this));
  },

  getSource: function () {
    return this.constants.CONTENT_SCRIPT;
  },

  registerCallback: function (message, callback) {
    if (!callback) return;

    // Message has requestId when we are sending response
    const requestIdToUse = this.requestId++;
    this.eventCallbackMap[message.action + "_" + requestIdToUse] = callback;
    message.requestId = requestIdToUse;
  },

  invokeCallback: function (event) {
    const callbackRef = this.eventCallbackMap[event.data.action + "_" + event.data.requestId];

    if (typeof callbackRef === "function") {
      // We should remove the entry from map first before executing the callback otherwise we will store stale references of functions
      delete this.eventCallbackMap[event.data.action + "_" + event.data.requestId];
      callbackRef.call(this, event.data.response);
    }
  },

  sendMessage: function (message, callback) {
    if (!message.action) {
      Logger.error("Invalid message. Must contain some action");
      return;
    }

    this.registerCallback(message, callback);

    message[this.constants.SOURCE_FIELD] = this.getSource();
    window.postMessage(message, window.origin);
  },

  sendResponse: function (originalEventData, response) {
    const message = {
      action: originalEventData.action,
      requestId: originalEventData.requestId,
      response: response,
    };

    message[this.constants.SOURCE_FIELD] = this.constants.CONTENT_SCRIPT;
    window.postMessage(message, window.origin);
  },

  handleMessageReceived: function (event) {
    const that = this;

    if (event && !RQ.Utils.isAppURL(event.origin)) {
      if (RQ.configs.logLevel === "debug") {
        console.log("Ignoring message from the following domain", event.origin, event.data);
      }

      return;
    }

    if (event && event.data && event.data.source === this.constants.PAGE_SCRIPT) {
      RQ.configs.logLevel === "debug" && console.log("Received message:", event.data);

      // Check whether it is a response to invoke callback or a request to perform an action
      if (typeof event.data.response !== "undefined") {
        return this.invokeCallback(event);
      }

      // Process actions
      if (event.data.action === "GET_STORAGE_TYPE") {
        StorageService.getStorageType().then((storageType) => {
          that.sendResponse(event.data, { storageType });
        });
      } else if (event.data.action === "SET_STORAGE_TYPE") {
        StorageService.setStorageType(event.data.storageType).then(() => {
          that.sendResponse(event.data, { success: true });
        });
      } else if (event.data.action === "GET_STORAGE_INFO") {
        StorageService.getStorageType().then((storageType) => {
          chrome.storage[storageType].get(null, (superObject) => {
            const storageCachedRecords = [];
            for (let key in superObject) {
              if (superObject[key].hasOwnProperty("objectType") || superObject[key].hasOwnProperty("ruleType")) {
                storageCachedRecords.push(superObject[key]);
              }
            }

            that.sendResponse(event.data, {
              storageType: storageType,
              numItems: storageCachedRecords.length,
              bytesUsed: JSON.stringify(storageCachedRecords).length,
            });
          });
        });
      } else if (event.data.action === "GET_STORAGE_SUPER_OBJECT") {
        StorageService.getStorageType().then((storageType) => {
          chrome.storage[storageType].get(null, (superObject) => {
            that.sendResponse(event.data, superObject);
          });
        });
      } else if (event.data.action === "GET_STORAGE_OBJECT") {
        StorageService.getStorageType().then((storageType) => {
          chrome.storage[storageType].get(event.data.key, (obj) => {
            that.sendResponse(event.data, obj[event.data.key]);
          });
        });
      } else if (event.data.action === "SAVE_STORAGE_OBJECT") {
        StorageService.getStorageType().then((storageType) => {
          chrome.storage[storageType].set(event.data.object, () => {
            that.sendResponse(event.data);
          });
        });
      } else if (event.data.action === "REMOVE_STORAGE_OBJECT") {
        StorageService.getStorageType().then((storageType) => {
          chrome.storage[storageType].remove(event.data.key, () => {
            that.sendResponse(event.data);
          });
        });
      } else if (event.data.action === "CLEAR_STORAGE") {
        StorageService.getStorageType().then((storageType) => {
          chrome.storage[storageType].clear(() => {
            that.sendResponse(event.data);
          });
        });
      } else if (event.data.action === "GET_USER_INFO") {
        StorageService.getRecordFromStorage("user_info", "sync").then((obj) =>
          that.sendResponse(event.data, obj || {})
        );
      } else if (
        [
          RQ.EXTENSION_MESSAGES.FOCUS_TAB,
          RQ.EXTENSION_MESSAGES.GET_FULL_LOGS,
          RQ.EXTENSION_MESSAGES.CLEAR_LOGS_FOR_TAB,
          RQ.EXTENSION_MESSAGES.CLEAR_LOGS_FOR_DOMAIN,
          RQ.EXTENSION_MESSAGES.GET_FLAGS,
          RQ.EXTENSION_MESSAGES.GET_TAB_SESSION,
          RQ.EXTENSION_MESSAGES.GET_API_RESPONSE,
          RQ.EXTENSION_MESSAGES.NOTIFY_APP_LOADED,
          RQ.EXTENSION_MESSAGES.START_RECORDING_ON_URL,
        ].includes(event.data.action)
      ) {
        this.delegateMessageToBackground(event.data);
      }
    }
  },

  delegateMessageToBackground: function (message) {
    const that = this;
    chrome.runtime.sendMessage(message, (bgResponse) => {
      that.sendResponse(message, bgResponse);
    });
  },

  init: function () {
    this.addMessageListener();
  },
};

RQ.ContentScriptMessageHandler.init();
