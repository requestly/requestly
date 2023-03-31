import { CLIENT_MESSAGES } from "../constants";

export const sendEventToBackground = (
  eventName: string,
  eventParams: Record<string, any> = {}
) => {
  const eventTs = Date.now();
  const eventOptions = { time: eventTs };
  eventParams.source = "extension";

  chrome.runtime.sendMessage({
    action: CLIENT_MESSAGES.ADD_EVENT,
    payload: {
      eventName,
      eventParams,
      eventOptions,
    },
  });
};
