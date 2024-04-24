import { CLIENT_MESSAGES } from "common/constants";
import { SessionRecordingConfig } from "common/types";

type SendResponseCallback = (payload: unknown) => void;

const sendResponseCallbacks: { [action: string]: SendResponseCallback } = {};
let isRecording = false;
let isExplicitRecording = false;
let markRecordingIcon = false;

export const initSessionRecording = () => {
  chrome.runtime.sendMessage({ action: CLIENT_MESSAGES.INIT_SESSION_RECORDING }).then(sendStartRecordingEvent);

  chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
      case CLIENT_MESSAGES.START_RECORDING:
        sendStartRecordingEvent(message.payload);
        break;
    }
  });
};

const isIframe = (): boolean => {
  return window.top !== window;
};

const sendStartRecordingEvent = (sessionRecordingConfig: SessionRecordingConfig) => {
  if (!sessionRecordingConfig) {
    return;
  }

  const isIFrame = isIframe();

  if (!isIFrame) {
    addListeners();
  }
  sendMessageToClient("startRecording", {
    relayEventsToTop: isIFrame,
    console: true,
    network: true,
    maxDuration: (sessionRecordingConfig.maxDuration || 5) * 60 * 1000, // minutes -> milliseconds
  });

  isExplicitRecording = sessionRecordingConfig.explicit ?? false;

  if (isExplicitRecording) {
    markRecordingIcon = true;
  } else {
    markRecordingIcon = sessionRecordingConfig.markRecordingIcon ?? false;
  }
};

const addListeners = () => {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.IS_RECORDING_SESSION:
        sendResponse(isRecording);
        break;

      case CLIENT_MESSAGES.GET_TAB_SESSION:
        sendMessageToClient("getSessionData", null, sendResponse);
        return true; // notify sender to wait for response and not resolve request immediately

      case CLIENT_MESSAGES.IS_EXPLICIT_RECORDING_SESSION:
        sendResponse(isExplicitRecording);
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
      isRecording = true;
      chrome.runtime.sendMessage({
        action: CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STARTED,
        payload: {
          markRecordingIcon,
        },
      });
    } else if (event.data.action === "sessionRecordingStopped") {
      isRecording = false;
      isExplicitRecording = false;
      markRecordingIcon = false;

      chrome.runtime.sendMessage({
        action: CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STOPPED,
      });
    }
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
