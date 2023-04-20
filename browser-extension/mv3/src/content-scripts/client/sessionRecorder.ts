import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "common/constants";
import { SessionRecordingConfig } from "common/types";

type SendResponseCallback = (payload: unknown) => void;

const sendResponseCallbacks: { [action: string]: SendResponseCallback } = {};
let isRecording = false;

export const initSessionRecording = () => {
  chrome.runtime.sendMessage({ action: CLIENT_MESSAGES.INIT_SESSION_RECORDING }, sendStartRecordingEvent);

  chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
      case CLIENT_MESSAGES.START_RECORDING:
        chrome.runtime.sendMessage(
          { action: EXTENSION_MESSAGES.INIT_SESSION_RECORDING_WITH_NEW_CONFIG },
          sendStartRecordingEvent
        );
    }
  });
};

const isIframe = (): boolean => {
  return window.top !== window;
};

const sendStartRecordingEvent = (sessionRecordingConfig: SessionRecordingConfig) => {
  if (sessionRecordingConfig) {
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
  }
};

const addListeners = () => {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.IS_RECORDING_SESSION:
        sendResponse(isRecording);
        break;

      case CLIENT_MESSAGES.GET_TAB_SESSION:
        if (isRecording) {
          sendMessageToClient("getSessionData", null, sendResponse);
        }
        return true; // notify sender to wait for response and not resolve request immediately
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
