RQ.SessionRecorder = {};

RQ.SessionRecorder.setup = () => {
  RQ.SessionRecorder.isInitialized = false;
  RQ.SessionRecorder.isRecording = false;
  RQ.SessionRecorder.isExplicitRecording = false;
  RQ.SessionRecorder.markRecordingIcon = false;
  RQ.SessionRecorder.widgetPosition = null;
  RQ.SessionRecorder.showWidget = false;
  RQ.SessionRecorder.recordingStartTime = null;
  RQ.SessionRecorder.sendResponseCallbacks = {};
  RQ.SessionRecorder.recordingMode;

  const isTopDocument = !RQ.SessionRecorder.isIframe();

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    // messages for all the frames
    switch (message.action) {
      case RQ.CLIENT_MESSAGES.START_RECORDING:
        RQ.SessionRecorder.startRecording(message.payload).then(() => {
          // only the top document should send confirmation
          if (isTopDocument) {
            sendResponse();
          }
        });
        return true;

      case RQ.CLIENT_MESSAGES.STOP_RECORDING:
        RQ.SessionRecorder.sendMessageToClient("stopRecording", null);
        break;
    }

    // messages for only the top document
    if (isTopDocument) {
      switch (message.action) {
        case RQ.CLIENT_MESSAGES.IS_RECORDING_SESSION:
          sendResponse(RQ.SessionRecorder.isRecording);
          break;

        case RQ.CLIENT_MESSAGES.IS_EXPLICIT_RECORDING_SESSION:
          sendResponse(RQ.SessionRecorder.isExplicitRecording);
          break;

        case RQ.CLIENT_MESSAGES.GET_TAB_SESSION:
          RQ.SessionRecorder.sendMessageToClient("getSessionData", null, (session) =>
            sendResponse({
              ...session,
              recordingMode: RQ.SessionRecorder.recordingMode,
            })
          );
          return true;
      }
    }
  });
};

RQ.SessionRecorder.startRecording = async (options = {}) => {
  const {
    config,
    previousSession,
    notify,
    explicit = false,
    widgetPosition,
    showWidget,
    recordingStartTime,
    markRecordingIcon = true,
  } = options;

  await RQ.SessionRecorder.initialize();

  if (!explicit && RQ.SessionRecorder.isExplicitRecording) {
    return;
  }

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
  RQ.SessionRecorder.widgetPosition = widgetPosition;
  RQ.SessionRecorder.showWidget = showWidget;
  RQ.SessionRecorder.recordingMode = explicit ? "manual" : "auto";
  RQ.SessionRecorder.markRecordingIcon = markRecordingIcon;

  if (explicit) {
    RQ.SessionRecorder.recordingStartTime = recordingStartTime ?? Date.now();
    RQ.SessionRecorder.hideAutoModeWidget();
  }
};

RQ.SessionRecorder.initialize = () => {
  return new Promise((resolve) => {
    if (RQ.SessionRecorder.isInitialized) {
      resolve();
    }

    RQ.ClientUtils.addRemoteJS(chrome.runtime.getURL("libs/requestly-web-sdk.js"), () => {
      RQ.ClientUtils.executeJS(`(${RQ.SessionRecorder.bootstrapClient.toString()})('${RQ.PUBLIC_NAMESPACE}')`);
      RQ.SessionRecorder.addMessageListeners();
      RQ.SessionRecorder.isInitialized = true;
      resolve();
    });
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
        markRecordingIcon: RQ.SessionRecorder.markRecordingIcon,
      });

      if (RQ.SessionRecorder.showWidget) {
        if (RQ.SessionRecorder.isExplicitRecording) {
          RQ.SessionRecorder.showManualModeRecordingWidget();
        } else {
          RQ.SessionRecorder.showAutoModeRecordingWidget();
        }
      }
    } else if (event.data.action === "sessionRecordingStopped") {
      RQ.SessionRecorder.isRecording = false;
      RQ.SessionRecorder.isExplicitRecording = false;
      RQ.SessionRecorder.showWidget = false;
      RQ.SessionRecorder.recordingStartTime = null;
      RQ.SessionRecorder.markRecordingIcon = false;

      RQ.SessionRecorder.hideManualModeWidget();
      RQ.SessionRecorder.hideAutoModeWidget();

      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STOPPED,
      });
    }
  });

  window.addEventListener("beforeunload", () => {
    RQ.SessionRecorder.sendMessageToClient("getSessionData", null, (session) => {
      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.CACHE_RECORDED_SESSION_ON_PAGE_UNLOAD,
        payload: {
          session,
          widgetPosition: RQ.SessionRecorder.widgetPosition,
          recordingMode: RQ.SessionRecorder.recordingMode,
          recordingStartTime: RQ.SessionRecorder.recordingStartTime,
        },
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
      window[namespace]?.sessionRecorder?.stop?.();
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

RQ.SessionRecorder.showManualModeRecordingWidget = () => {
  let widget = RQ.SessionRecorder.getManualModeWidget();

  if (!widget) {
    widget = document.createElement("rq-session-recording-widget");
    widget.classList.add("rq-element");
    document.documentElement.appendChild(widget);

    widget.addEventListener("stop", () => {
      chrome.runtime.sendMessage({
        action: RQ.EXTENSION_MESSAGES.STOP_RECORDING,
        openRecording: true,
      });
    });

    widget.addEventListener("discard", () => {
      chrome.runtime.sendMessage({
        action: RQ.EXTENSION_MESSAGES.STOP_RECORDING,
      });
    });

    widget.addEventListener("moved", (evt) => {
      RQ.SessionRecorder.widgetPosition = evt.detail;
    });
  }

  const recordingLimitInMilliseconds = 5 * 60 * 1000; // 5 mins * 60 secs * 1000 ms
  const recordingTime = Date.now() - RQ.SessionRecorder.recordingStartTime;
  const currentRecordingTime = recordingTime <= recordingLimitInMilliseconds ? recordingTime : null;

  widget.dispatchEvent(
    new CustomEvent("show", {
      detail: {
        currentRecordingTime,
        position: RQ.SessionRecorder.widgetPosition,
      },
    })
  );
};

RQ.SessionRecorder.hideManualModeWidget = () => {
  const widget = RQ.SessionRecorder.getManualModeWidget();
  widget?.dispatchEvent(new CustomEvent("hide"));
};

RQ.SessionRecorder.getManualModeWidget = () => {
  return document.querySelector("rq-session-recording-widget");
};

RQ.SessionRecorder.showAutoModeRecordingWidget = () => {
  const tagName = "rq-session-recording-auto-mode-widget";
  let widget = document.querySelector(tagName);

  if (!widget) {
    widget = document.createElement(tagName);
    widget.classList.add("rq-element");
    document.documentElement.appendChild(widget);

    widget.addEventListener("watch", () => {
      chrome.runtime.sendMessage({
        action: RQ.EXTENSION_MESSAGES.WATCH_RECORDING,
      });
    });

    widget.addEventListener("moved", (evt) => {
      RQ.SessionRecorder.widgetPosition = evt.detail;
    });
  }

  widget.dispatchEvent(
    new CustomEvent("show", {
      detail: {
        position: RQ.SessionRecorder.widgetPosition,
      },
    })
  );
};

RQ.SessionRecorder.hideAutoModeWidget = () => {
  let widget = document.querySelector("rq-session-recording-auto-mode-widget");
  widget?.dispatchEvent(new CustomEvent("hide"));
};
