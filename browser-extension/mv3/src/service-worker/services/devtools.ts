import { Rule } from "common/types";

const portConnections = new Map<number, chrome.runtime.Port>();

export const initDevtoolsListener = () => {
  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== "rq_devtools") {
      return;
    }

    port.onMessage.addListener(function (msg) {
      switch (msg.action) {
        case "registerDevTool": {
          portConnections.set(msg.tabId, port);
          break;
        }

        case "heartbeat":
          return;
      }
    });

    port.onDisconnect.addListener(function (port) {
      portConnections.forEach((value, key) => {
        if (value === port) {
          portConnections.delete(key);
        }
      });
    });
  });
};

export const sendLogToDevtools = (rule: Rule, requestDetails: chrome.webRequest.WebRequestDetails) => {
  sendMessageToDevtools(requestDetails.tabId, {
    rule,
    timestamp: requestDetails.timeStamp || Date.now(),
    requestURL: requestDetails.url,
    requestType: requestDetails.type,
    requestMethod: requestDetails.method,
  });
};

const sendMessageToDevtools = (tabId: number, message: any) => {
  const port = portConnections.get(tabId);
  if (port) {
    port.postMessage(message);
  }
};
