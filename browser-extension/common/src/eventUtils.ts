import { EXTENSION_MESSAGES } from "./constants";

export const sendEventToBackground = (eventName: string, eventParams: Record<string, any> = {}) => {
  chrome.runtime.sendMessage({
    action: EXTENSION_MESSAGES.LOG_EVENT,
    eventName,
    eventParams,
  });
};
