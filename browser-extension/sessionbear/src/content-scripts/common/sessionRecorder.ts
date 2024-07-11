import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "../../constants";
import { SessionRecordingConfig } from "../../types";
import { getRecord } from "../../storage";

type SendResponseCallback = (payload: unknown) => void;

interface SessionRecorderState {
  isRecording: boolean;
  isExplicitRecording: boolean;
  markRecordingIcon: boolean;
  recordingMode?: string;
  widgetPosition?: { top?: number; bottom?: number; left?: number; right?: number };
  recordingStartTime?: number;
  showWidget?: boolean;
}

const sendResponseCallbacks: { [action: string]: SendResponseCallback } = {};
let isRecorderInitialized = false;
const sessionRecorderState: SessionRecorderState = {
  isRecording: false,
  isExplicitRecording: false,
  markRecordingIcon: false,
  widgetPosition: null,
  recordingStartTime: null,
  showWidget: false,
};

export const initSessionRecording = () => {
  chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
      case CLIENT_MESSAGES.START_RECORDING:
        sendStartRecordingEvent(message.payload);
        injectSessionDraftViewer();
        break;
    }
  });

  sendPageShowPersistedEvent();
};

const sendPageShowPersistedEvent = () => {
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      chrome.runtime.sendMessage({
        action: CLIENT_MESSAGES.NOTIFY_PAGE_LOADED_FROM_CACHE,
        payload: {
          isRecordingSession: sessionRecorderState.isRecording,
        },
      });
    }
  });
};

const isIframe = (): boolean => {
  return window.top !== window;
};

const initRecorder = async () => {
  return new Promise<void>((resolve) => {
    if (isRecorderInitialized) {
      resolve();
    }
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.INIT_SESSION_RECORDER }, () => {
      isRecorderInitialized = true;
      resolve();
    });
  });
};

const sendStartRecordingEvent = async (sessionRecordingConfig: SessionRecordingConfig) => {
  if (!sessionRecordingConfig) {
    return;
  }

  await initRecorder();

  const {
    notify,
    markRecordingIcon = true,
    explicit = false,
    recordingStartTime = Date.now(),
    showWidget,
    widgetPosition,
    previousSession,
  } = sessionRecordingConfig;

  const isIFrame = isIframe();

  if (!isIFrame) {
    addListeners();
  }
  sendMessageToClient("startRecording", {
    relayEventsToTop: isIFrame,
    console: true,
    network: true,
    maxDuration: (sessionRecordingConfig.maxDuration || 5) * 60 * 1000, // minutes -> milliseconds
    previousSession: !isIFrame ? previousSession : null,
  });

  sessionRecorderState.isExplicitRecording = explicit;
  sessionRecorderState.markRecordingIcon = markRecordingIcon;
  sessionRecorderState.showWidget = showWidget;
  sessionRecorderState.widgetPosition = widgetPosition;
  sessionRecorderState.recordingMode = explicit ? "manual" : "auto";

  if (notify) {
    showToast();
  }

  if (explicit) {
    sessionRecorderState.recordingStartTime = recordingStartTime;
    hideAutoModeWidget();
  }
};

const addListeners = () => {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.IS_RECORDING_SESSION:
        sendResponse(sessionRecorderState.isRecording);
        break;

      case CLIENT_MESSAGES.GET_TAB_SESSION:
        sendMessageToClient("getSessionData", null, (session: any) => {
          sendResponse({
            ...session,
            recordingMode: sessionRecorderState.recordingMode,
          });
        });
        return true; // notify sender to wait for response and not resolve request immediately

      case CLIENT_MESSAGES.IS_EXPLICIT_RECORDING_SESSION:
        sendResponse(sessionRecorderState.isExplicitRecording);
        break;

      case CLIENT_MESSAGES.STOP_RECORDING:
        sendMessageToClient("stopRecording", null);
    }

    return false;
  });

  window.addEventListener("message", function (event) {
    if (event.source !== window || event.data.source !== "requestly:client") {
      return;
    }

    if (event.data.response) {
      sendResponseToRuntime(event.data.action, event.data.payload);
    } else if (event.data.action === "sessionRecordingStarted") {
      sessionRecorderState.isRecording = true;
      chrome.runtime.sendMessage({
        action: CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STARTED,
        payload: {
          markRecordingIcon: sessionRecorderState.markRecordingIcon,
        },
      });

      if (sessionRecorderState.showWidget) {
        if (sessionRecorderState.isExplicitRecording) {
          showManualModeRecordingWidget();
        } else {
          showAutoModeRecordingWidget();
        }
      }
    } else if (event.data.action === "sessionRecordingStopped") {
      sessionRecorderState.isRecording = false;
      sessionRecorderState.isExplicitRecording = false;
      sessionRecorderState.markRecordingIcon = false;

      hideManualModeWidget();
      hideAutoModeWidget();

      chrome.runtime.sendMessage({
        action: CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STOPPED,
      });
    }
  });

  window.addEventListener("beforeunload", () => {
    sendMessageToClient("getSessionData", null, (session) => {
      chrome.runtime.sendMessage({
        action: EXTENSION_MESSAGES.CACHE_RECORDED_SESSION_ON_PAGE_UNLOAD,
        payload: {
          session,
          widgetPosition: sessionRecorderState.widgetPosition,
          recordingMode: sessionRecorderState.recordingMode,
          recordingStartTime: sessionRecorderState.recordingStartTime,
        },
      });
    });
  });
};

const sendResponseToRuntime = (action: string, payload: unknown) => {
  sendResponseCallbacks[action]?.(payload);
  delete sendResponseCallbacks[action];
};

const sendMessageToClient = (action: string, payload: unknown, sendResponseCallback?: SendResponseCallback) => {
  window.postMessage({ source: "requestly:extension", action, payload }, window.location.href);
  if (sendResponseCallback) {
    sendResponseCallbacks[action] = sendResponseCallback;
  }
};

const showManualModeRecordingWidget = () => {
  let widget = getManualModeWidget();

  if (!widget) {
    widget = document.createElement("rq-session-recording-widget");
    widget.classList.add("rq-element");
    document.documentElement.appendChild(widget);

    widget.addEventListener("stop", () => {
      chrome.runtime.sendMessage({
        action: EXTENSION_MESSAGES.STOP_RECORDING,
        openRecording: true,
      });
      openSessionDraftViewer();
    });

    widget.addEventListener("discard", () => {
      chrome.runtime.sendMessage({
        action: EXTENSION_MESSAGES.STOP_RECORDING,
      });
      openSessionDraftViewer();
    });

    widget.addEventListener("moved", (evt: CustomEvent) => {
      sessionRecorderState.widgetPosition = evt.detail;
    });
  }

  const recordingLimitInMilliseconds = 5 * 60 * 1000; // 5 mins * 60 secs * 1000 ms
  const recordingTime = Date.now() - sessionRecorderState.recordingStartTime;
  const currentRecordingTime = recordingTime <= recordingLimitInMilliseconds ? recordingTime : null;

  widget.dispatchEvent(
    new CustomEvent("show", {
      detail: {
        currentRecordingTime,
        position: sessionRecorderState.widgetPosition,
      },
    })
  );
};

const hideManualModeWidget = () => {
  const widget = getManualModeWidget();
  widget?.dispatchEvent(new CustomEvent("hide"));
};

const getManualModeWidget = () => {
  return document.querySelector("rq-session-recording-widget");
};

const showAutoModeRecordingWidget = () => {
  const tagName = "rq-session-recording-auto-mode-widget";
  let widget = document.querySelector(tagName);

  if (!widget) {
    widget = document.createElement(tagName);
    widget.classList.add("rq-element");
    document.documentElement.appendChild(widget);

    widget.addEventListener("watch", () => {
      chrome.runtime.sendMessage({
        action: EXTENSION_MESSAGES.WATCH_RECORDING,
      });
    });

    widget.addEventListener("moved", (evt: CustomEvent) => {
      sessionRecorderState.widgetPosition = evt.detail;
    });
  }

  widget.dispatchEvent(
    new CustomEvent("show", {
      detail: {
        position: sessionRecorderState.widgetPosition,
      },
    })
  );
};

const hideAutoModeWidget = () => {
  let widget = document.querySelector("rq-session-recording-auto-mode-widget");
  widget?.dispatchEvent(new CustomEvent("hide"));
};

const showToast = () => {
  const rqToast = document.createElement("rq-toast");
  rqToast.classList.add("rq-element");
  rqToast.setAttribute("heading", "SessionBear is recording session on this tab!");
  rqToast.setAttribute("icon-path", chrome.runtime.getURL("resources/images/128x128.png"));
  const rqToastContent = `
  <div slot="content">
    You can save up to last 5 minutes anytime by clicking on SessionBear extension icon to save & upload activity for this tab.
  </div>
  `;
  try {
    rqToast.innerHTML = rqToastContent;
  } catch (e) {
    // @ts-ignore
    const trustedTypesPolicy = window.trustedTypes?.createPolicy?.("rq-html-policy", {
      createHTML: (html: HTMLElement) => html,
    });
    rqToast.innerHTML = trustedTypesPolicy.createHTML(rqToastContent);
  }

  document.documentElement.appendChild(rqToast);
};

const injectSessionDraftViewer = () => {
  const sessionDraftViewer = document.createElement("rq-session-draft-viewer");
  sessionDraftViewer.classList.add("rq-draft-session");
  sessionDraftViewer.style.position = "fixed";
  sessionDraftViewer.style.inset = "0";
  sessionDraftViewer.style.zIndex = "999999";
  sessionDraftViewer.style.display = "none";
  sessionDraftViewer.style.justifyContent = "center";
  sessionDraftViewer.style.alignItems = "center";

  // const container = document.createElement("div");
  // container.style.position = "relative";
  // container.style.height = "100vh";
  // container.style.width = "100vw";

  const iframe = document.createElement("iframe");
  iframe.src = "http://localhost:3000/sessions/draft";
  // iframe.style.position = "absolute";
  // iframe.style.top = "50%";
  // iframe.style.left = "50%";
  // iframe.style.transform = "translate(-50%, -50%)";
  iframe.style.height = "90vh";
  iframe.style.width = "85vw";
  iframe.id = "rq-session-draft-viewer-iframe";

  // container.appendChild(iframe);
  sessionDraftViewer.appendChild(iframe);
  document.documentElement.appendChild(sessionDraftViewer);
  getRecord("user_token")
    .then((token) => {
      iframe.contentWindow.postMessage(
        { source: "pookie", action: "authenticate_user", type: "AUTH", payload: token },
        "*"
      );
    })
    .catch(() => {
      console.log("User token not found");
    });
};

const openSessionDraftViewer = () => {
  const sessionDraftViewer = document.querySelector(".rq-draft-session") as HTMLElement;
  sessionDraftViewer.style.display = "flex";

  // get session from tab and send message to iframe
  sendMessageToClient("getSessionData", null, (session) => {
    const iframe = sessionDraftViewer.querySelector("#rq-session-draft-viewer-iframe") as HTMLIFrameElement;
    iframe.contentWindow.postMessage(
      { source: "pookie", action: "load_draft_session", type: "DRAFT_SESSION", payload: session },
      "*"
    );
  });
};
