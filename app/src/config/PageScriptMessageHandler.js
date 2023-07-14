import Logger from "lib/logger";

const PageScriptMessageHandler = {
  eventCallbackMap: {},
  messageListeners: {},
  requestId: 1,

  constants: {
    SOURCE: "page_script",
    DOMAIN: window.location.origin,
  },

  addMessageListener: function (messageAction, listener) {
    this.messageListeners[messageAction] = listener;
  },

  removeMessageListener: function (messageName) {
    delete this.messageListeners[messageName];
  },

  registerCallback: function (message, callback) {
    if (!callback) return;

    // Message has requestId when we are sending response
    const requestIdToUse = this.requestId++;
    this.eventCallbackMap[message.action + "_" + requestIdToUse] = callback;
    message.requestId = requestIdToUse;
  },

  invokeCallback: function (data) {
    const callbackRef = this.eventCallbackMap[data.action + "_" + data.requestId];

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

    message.source = this.constants.SOURCE;
    window.postMessage(message, this.constants.DOMAIN);
  },

  sendResponse: function (originalEventData, response) {
    const message = {
      action: originalEventData.action,
      requestId: originalEventData.requestId,
      response: response,
    };

    message.source = this.constants.SOURCE;
    window.postMessage(message, this.constants.DOMAIN);
  },

  handleMessageReceived: function (event) {
    if (event && event.origin !== this.constants.DOMAIN) {
      Logger.log("Ignoring message from the following domain", event.origin, event.data);

      return;
    }

    if (event?.data?.source !== this.constants.SOURCE) {
      Logger.log("Received message:", event.data);

      if (event.data.requestId && this.eventCallbackMap[`${event.data.action}_${event.data.requestId}`]) {
        this.invokeCallback(event.data);
      } else {
        this.messageHandler(event.data);
      }
    }
  },

  messageHandler: function (message) {
    const messageListener = this.messageListeners[message.action];

    if (messageListener) {
      const response = messageListener(message);

      if (response) {
        this.sendResponse(message, response);
      }
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

    window.addEventListener("message", this.handleMessageReceived.bind(this));
  },
};

export default PageScriptMessageHandler;
