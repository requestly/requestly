RQ.SessionRecorder = {
  isRecording: false,
  sendResponseCallbacks: {},
};

RQ.SessionRecorder.setup = () => {
  RQ.SessionRecorder.getRecordingConfig().then((config) => {
    if (config || RQ.SessionRecorder.explicitRecordingFlag.get()) {
      RQ.SessionRecorder.startRecording(config);
    }
  });

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case RQ.CLIENT_MESSAGES.START_RECORDING:
        RQ.SessionRecorder.explicitRecordingFlag.set();
        RQ.SessionRecorder.startRecording();
        break;
      case RQ.CLIENT_MESSAGES.STOP_RECORDING:
        RQ.SessionRecorder.sendMessageToClient("stopRecording");
        break;
      case RQ.CLIENT_MESSAGES.IS_EXPLICIT_RECORDING_SESSION:
        sendResponse(RQ.SessionRecorder.explicitRecordingFlag.get());
        break;
    }
  });
};

RQ.SessionRecorder.getRecordingConfig = () => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        action: RQ.CLIENT_MESSAGES.GET_SESSION_RECORDING_CONFIG,
      },
      resolve
    );
  });
};

RQ.SessionRecorder.startRecording = (sessionRecordingConfig) => {
  const isIFrame = RQ.SessionRecorder.isIframe();

  if (!isIFrame) {
    RQ.SessionRecorder.addListeners();
  }

  RQ.ClientUtils.addRemoteJS(chrome.runtime.getURL("libs/requestly-web-sdk.js"), () => {
    RQ.ClientUtils.executeJS(`(${RQ.SessionRecorder.bootstrapClient.toString()})('${RQ.PUBLIC_NAMESPACE}')`);
    RQ.SessionRecorder.sendMessageToClient("startRecording", {
      relayEventsToTop: isIFrame,
      console: true,
      network: true,
      maxDuration: (sessionRecordingConfig?.maxDuration || 5) * 60 * 1000, // minutes -> milliseconds
    });
  });
};

RQ.SessionRecorder.isIframe = () => {
  return window.top !== window;
};

RQ.SessionRecorder.addListeners = () => {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case RQ.CLIENT_MESSAGES.IS_RECORDING_SESSION:
        sendResponse(RQ.SessionRecorder.isRecording);
        break;

      case RQ.CLIENT_MESSAGES.GET_TAB_SESSION:
        RQ.SessionRecorder.sendMessageToClient("getSessionData", null, sendResponse);
        return true; // notify sender to wait for response and not resolve request immediately
    }
  });

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
      RQ.SessionRecorder.explicitRecordingFlag.clear();
      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STOPPED,
      });
    }
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

RQ.SessionRecorder.explicitRecordingFlag = {
  IS_EXPLICIT_RECORDING: "__RQ__isExplicitRecording",
  set: () => {
    window.sessionStorage.setItem(RQ.SessionRecorder.explicitRecordingFlag.IS_EXPLICIT_RECORDING, true);
  },
  get: () => {
    return window.sessionStorage.getItem(RQ.SessionRecorder.explicitRecordingFlag.IS_EXPLICIT_RECORDING);
  },
  clear: () => {
    window.sessionStorage.removeItem(RQ.SessionRecorder.explicitRecordingFlag.IS_EXPLICIT_RECORDING);
  },
};
