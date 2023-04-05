import Logger from "lib/logger";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
// import { handleEventBatches } from "modules/analytics/events/extension";

const PageScriptMessageHandler = {
  eventCallbackMap: {},
  requestId: 1,

  constants: {
    CONTENT_SCRIPT: "content_script",
    PAGE_SCRIPT: "page_script",
    DOMAIN: window.location.origin,
    SOURCE_FIELD: "source",
  },

  addMessageListener: function () {
    window.addEventListener("message", this.handleMessageReceived.bind(this));
  },

  getSource: function () {
    return this.constants.PAGE_SCRIPT;
  },

  registerCallback: function (message, callback) {
    if (!callback) return;

    // Message has requestId when we are sending response
    const requestIdToUse = this.requestId++;
    this.eventCallbackMap[message.action + "_" + requestIdToUse] = callback;
    message.requestId = requestIdToUse;
  },

  invokeCallback: function (data) {
    const callbackRef = this.eventCallbackMap[
      data.action + "_" + data.requestId
    ];

    if (typeof callbackRef === "function") {
      // We should remove the entry from map first before executing the callback otherwise we will store stale references of functions
      delete this.eventCallbackMap[data.action + "_" + data.requestId];
      callbackRef.call(this, data.response);
    }
  },

  sendMessage: function (message, callback) {
    if (!message.action) {
      Logger.error("Invalid message. Must contain some action");
      return;
    }

    this.registerCallback(message, callback);

    message[this.constants.SOURCE_FIELD] = this.getSource();
    window.postMessage(message, this.constants.DOMAIN);
  },

  sendResponse: function (originalEventData, response) {
    const message = {
      action: originalEventData.action,
      requestId: originalEventData.requestId,
      response: response,
    };

    message[this.constants.SOURCE_FIELD] = this.constants.PAGE_SCRIPT;
    window.postMessage(message, this.constants.DOMAIN);
  },

  handleMessageReceived: function (event) {
    if (event && event.origin !== this.constants.DOMAIN) {
      Logger.log(
        "Ignoring message from the following domain",
        event.origin,
        event.data
      );

      return;
    }

    if (
      event &&
      event.data &&
      event.data.source === this.constants.CONTENT_SCRIPT
    ) {
      this.messageHandler(event.data);

      Logger.log("Received message:", event.data);
      this.invokeCallback(event.data);
    }
  },

  messageHandler: function (message) {
    switch (message.action) {
      case GLOBAL_CONSTANTS.EXTENSION_MESSAGES.SEND_EXTENSION_EVENTS: {
        const ackBatchIds = message.eventBatches.map((batch) => batch.id);
        this.sendResponse(message, {
          ackIds: ackBatchIds,
          received: true,
        });
        // handleEventBatches(message.eventBatches);
        break;
      }
      default:
        return false;
    }
  },

  init: function () {
    // Handle Backward compatibility
    // We have updated domain to .io in newer version of extensions but older extension versions
    // will still try to send message to .in So this script is essentially running in .in page
    // Hence, we should post message to .in instead of .io (as per config)
    // To fix this Modify the config when this script is running in .in domain
    // To be removed after June
    if (
      window.location.hostname.indexOf("requestly.in") !== -1 &&
      this.constants.DOMAIN.indexOf("requestly.io") !== -1
    ) {
      this.constants.DOMAIN = this.constants.DOMAIN.replace(".io", ".in");
    }

    this.addMessageListener();
  },
};

export default PageScriptMessageHandler;
