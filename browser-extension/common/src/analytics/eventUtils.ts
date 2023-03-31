import { CLIENT_MESSAGES } from "../constants";

const sendEventToBackground = (
  eventName: string,
  eventParams: Record<string, any> = {}
) => {
  const eventTs = Date.now();
  const eventOptions = { time: eventTs };
  eventParams["log_source"] = "extension";

  chrome.runtime.sendMessage({
    action: CLIENT_MESSAGES.ADD_EVENT,
    payload: {
      eventName,
      eventParams,
      eventOptions,
    },
  });
};

export const sendEventFromPopup = (
  eventName: string,
  eventParams: Record<string, any> = {}
) => {
  eventParams["source"] = "popup";
  sendEventToBackground(eventName, eventParams);
};

export const sendEventFromDevtool = (
  eventName: string,
  eventParams: Record<string, any> = {}
) => {
  eventParams["source"] = "devtools";
  sendEventToBackground(eventName, eventParams);
};
