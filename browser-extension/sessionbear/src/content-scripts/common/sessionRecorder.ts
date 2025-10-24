import config from "../../config";
import { CLIENT_MESSAGES, CLIENT_SOURCE, CUSTOM_ELEMENTS, EXTENSION_MESSAGES, STORAGE_KEYS } from "../../constants";
import { getRecord } from "../../storage";
import { SessionRecordingConfig } from "../../types";

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

let isDraftSessionLoadedInIframe = false;
let isListenersInitialized = false;

export const initSessionRecording = () => {
  chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
      case CLIENT_MESSAGES.START_RECORDING:
        sendStartRecordingEvent(message.payload);
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

  if (!isIFrame && !isListenersInitialized) {
    addListeners();
    isListenersInitialized = true;
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

  injectDraftSessionViewer();
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
        break;

      case CLIENT_MESSAGES.VIEW_RECORDING:
        if (isDraftSessionLoadedInIframe) {
          viewDraftSession();
        } else {
          window.open(`${config.WEB_URL}/sessions/draft/${message.tabId}`, "_blank");
        }
        break;
    }

    return false;
  });

  window.addEventListener("message", function (event) {
    if (event.data.source !== CLIENT_SOURCE.SESSIONBEAR) {
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
    } else if (event.data.action === "draftSessionSaveClicked") {
      hideDraftSessionViewer();
      showPostSessionSaveWidget();
    } else if (event.data.action === "draftSessionSaved") {
      const { payload } = event.data;
      showDraftSessionSavedWidget(payload.sessionId);
    } else if (event.data.action === "draftSessionViewerLoaded") {
      isDraftSessionLoadedInIframe = true;
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
  window.postMessage({ source: "sessionbear:extension", action, payload }, window.location.href);
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
    });

    widget.addEventListener("discard", () => {
      chrome.runtime.sendMessage({
        action: EXTENSION_MESSAGES.STOP_RECORDING,
      });
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

const injectDraftSessionViewer = async () => {
  const exisitingSessionViewer = document.querySelector(CUSTOM_ELEMENTS.DRAFT_SESSION_VIEWER);
  if (exisitingSessionViewer) {
    exisitingSessionViewer.remove();
  }
  const postSaveSessionWidget = document.querySelector(CUSTOM_ELEMENTS.POST_SESSION_SAVE_WIDGET);
  if (postSaveSessionWidget) {
    postSaveSessionWidget.remove();
  }

  const refreshToken: string = await getRecord(STORAGE_KEYS.REFRESH_TOKEN);
  const activeWorkspaceId: string = await getRecord(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);

  const newSessionViewer = document.createElement(CUSTOM_ELEMENTS.DRAFT_SESSION_VIEWER);
  newSessionViewer.classList.add("rq-element");

  const iframeUrlParams = new URLSearchParams();
  if (refreshToken) iframeUrlParams.set("refreshToken", refreshToken);
  if (activeWorkspaceId) iframeUrlParams.set("workspaceId", activeWorkspaceId);

  newSessionViewer.setAttribute(
    "session-src",
    `${config.WEB_URL}/iframe/sessions/draft/iframe?${iframeUrlParams.toString()}`
  );

  document.documentElement.appendChild(newSessionViewer);
};

const viewDraftSession = () => {
  sendMessageToClient("getSessionData", null, (session) => {
    const draftSessionViewer = document.querySelector(CUSTOM_ELEMENTS.DRAFT_SESSION_VIEWER);
    draftSessionViewer.dispatchEvent(
      new CustomEvent("view-draft-session", {
        detail: {
          session,
        },
      })
    );
  });
};

const hideDraftSessionViewer = () => {
  const draftSessionViewer = document.querySelector(CUSTOM_ELEMENTS.DRAFT_SESSION_VIEWER);
  if (draftSessionViewer) {
    draftSessionViewer.dispatchEvent(new CustomEvent("hide-draft-session-viewer"));
  }
};

const showPostSessionSaveWidget = () => {
  const widget = document.querySelector(CUSTOM_ELEMENTS.POST_SESSION_SAVE_WIDGET);
  if (widget) {
    widget.remove();
  }

  const postSessionSaveWidget = document.createElement(CUSTOM_ELEMENTS.POST_SESSION_SAVE_WIDGET);
  postSessionSaveWidget.classList.add("rq-element");
  document.documentElement.appendChild(postSessionSaveWidget);

  postSessionSaveWidget.addEventListener("view-saved-session-clicked", (event: CustomEvent) => {
    const sessionURL = `${config.WEB_URL}/sessions/saved/${event.detail.sessionId}`;
    window.open(sessionURL, "_blank");
  });

  postSessionSaveWidget.addEventListener("close-post-session-save-widget-clicked", () => {
    postSessionSaveWidget.remove();
  });
};

const showDraftSessionSavedWidget = (sessionId: string) => {
  const postSessionSaveWidget = document.querySelector(CUSTOM_ELEMENTS.POST_SESSION_SAVE_WIDGET);
  postSessionSaveWidget.dispatchEvent(new CustomEvent("show-draft-session-saved-widget", { detail: { sessionId } }));
};
