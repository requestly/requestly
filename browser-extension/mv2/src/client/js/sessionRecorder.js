RQ.SessionRecorder = {};
RQ.SessionRecorder.isInitialized = false;
RQ.SessionRecorder.isRecording = false;
RQ.SessionRecorder.isExplicitRecording = false;
RQ.SessionRecorder.sendResponseCallbacks = {};

RQ.SessionRecorder.setup = () => {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case RQ.CLIENT_MESSAGES.START_RECORDING:
        RQ.SessionRecorder.startRecording(message.payload);
        break;

      case RQ.CLIENT_MESSAGES.STOP_RECORDING:
        RQ.SessionRecorder.sendMessageToClient("stopRecording");
        break;

      case RQ.CLIENT_MESSAGES.IS_RECORDING_SESSION:
        if (!RQ.SessionRecorder.isIframe()) {
          sendResponse(RQ.SessionRecorder.isRecording);
        }
        break;

      case RQ.CLIENT_MESSAGES.IS_EXPLICIT_RECORDING_SESSION:
        if (!RQ.SessionRecorder.isIframe()) {
          sendResponse(RQ.SessionRecorder.isExplicitRecording);
        }
        break;

      case RQ.CLIENT_MESSAGES.GET_TAB_SESSION:
        if (!RQ.SessionRecorder.isIframe()) {
          RQ.SessionRecorder.sendMessageToClient("getSessionData", null, sendResponse);
          return true; // notify sender to wait for response and not resolve request immediately
        }
        break;
    }
  });
};

RQ.SessionRecorder.startRecording = ({ config, previousSession, notify, explicit }) => {
  RQ.SessionRecorder.initialize(() => {
    RQ.SessionRecorder.sendMessageToClient("startRecording", {
      relayEventsToTop: RQ.SessionRecorder.isIframe(),
      console: true,
      network: true,
      maxDuration: (config?.maxDuration || 5) * 60 * 1000, // minutes -> milliseconds
      previousSession: !RQ.SessionRecorder.isIframe() ? previousSession : null,
    });

    if (notify) {
      RQ.SessionRecorder.showToast();
    }

    RQ.SessionRecorder.isExplicitRecording = explicit;
  });
};

RQ.SessionRecorder.initialize = (callback) => {
  if (RQ.SessionRecorder.isInitialized) {
    callback();
  }

  RQ.ClientUtils.addRemoteJS(chrome.runtime.getURL("libs/requestly-web-sdk.js"), () => {
    RQ.ClientUtils.executeJS(`(${RQ.SessionRecorder.bootstrapClient.toString()})('${RQ.PUBLIC_NAMESPACE}')`);
    RQ.SessionRecorder.addMessageListeners();
    RQ.SessionRecorder.isInitialized = true;
    callback();
  });
};

RQ.SessionRecorder.isIframe = () => {
  return window.top !== window;
};

RQ.SessionRecorder.addMessageListeners = () => {
  if (RQ.SessionRecorder.isIframe()) {
    return;
  }

  window.addEventListener("message", function (event) {
    if (event.source !== window || event.data.source !== "requestly:client") {
      return;
    }

    if (event.data.response) {
      RQ.SessionRecorder.sendResponseToRuntime(event.data.action, event.data.payload);
    } else if (event.data.action === "sessionRecordingStarted") {
      RQ.SessionRecorder.isRecording = true;
      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STARTED,
      });
    } else if (event.data.action === "sessionRecordingStopped") {
      RQ.SessionRecorder.isRecording = false;
      RQ.SessionRecorder.isExplicitRecording = false;
      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STOPPED,
      });
    }
  });

  window.addEventListener("beforeunload", (event) => {
    event.preventDefault();

    RQ.SessionRecorder.sendMessageToClient("getSessionData", null, (session) => {
      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.CACHE_RECORDED_SESSION_ON_PAGE_UNLOAD,
        session,
      });
    });
  });
};

RQ.SessionRecorder.sendResponseToRuntime = (action, payload) => {
  RQ.SessionRecorder.sendResponseCallbacks[action]?.(payload);
  delete RQ.SessionRecorder.sendResponseCallbacks[action];
};

RQ.SessionRecorder.sendMessageToClient = (action, payload, sendResponseCallback) => {
  window.postMessage({ source: "requestly:extension", action, payload }, window.location.href);
  if (sendResponseCallback) {
    RQ.SessionRecorder.sendResponseCallbacks[action] = sendResponseCallback;
  }
};

/**
 * Do not refer other function/variables from this function.
 * This function will be injected in website and will run in a different JS context.
 */
RQ.SessionRecorder.bootstrapClient = (namespace) => {
  window[namespace] = window[namespace] || {};

  const sendMessageToExtension = (action, payload) => {
    window.postMessage({ source: "requestly:client", action, payload }, window.location.href);
  };

  const sendResponseToExtension = (action, payload) => {
    window.postMessage({ source: "requestly:client", response: true, action, payload }, window.location.href);
  };

  window.addEventListener("message", function (event) {
    // We only accept messages from ourselves
    if (event.source !== window || event.data.source !== "requestly:extension") {
      return;
    }

    if (event.data.action === "startRecording") {
      window[namespace].sessionRecorder = new Requestly.SessionRecorder(event.data.payload);
      window[namespace].sessionRecorder.start();
      sendMessageToExtension("sessionRecordingStarted");
    } else if (event.data.action === "stopRecording") {
      window[namespace].sessionRecorder.stop();
      sendMessageToExtension("sessionRecordingStopped");
    } else if (event.data.action === "getSessionData") {
      try {
        sendResponseToExtension(event.data.action, window[namespace].sessionRecorder.getSession());
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        sendResponseToExtension(event.data.action, error);
        throw err;
      }
    }
  });
};

RQ.SessionRecorder.showToast = () => {
  const rqToast = document.createElement("rq-toast");
  rqToast.classList.add("rq-element");
  rqToast.setAttribute("heading", "Requestly is recording session on this tab!");
  rqToast.setAttribute("icon-path", chrome.runtime.getURL("resources/images/128x128.png"));
  rqToast.innerHTML = `
  <div slot="content">
    You can save up to last 5 minutes anytime by clicking on Requestly extension icon to save & upload activity for this tab.
  </div>
  `;

  document.documentElement.appendChild(rqToast);
};
