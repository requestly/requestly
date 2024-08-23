import { Rule } from "common/types";
import { getVariable, setVariable, Variable } from "../variable";

type DevtoolsMap = Record<string, chrome.runtime.Port>;

export const initDevtoolsListener = () => {
  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== "rq_devtools") {
      return;
    }

    port.onMessage.addListener(function (msg) {
      if (msg.action === "registerDevTool") {
        console.log("!!!debug", "devtool msg", msg, port);
        getVariable<DevtoolsMap>(Variable.DEVTOOLS, {}).then((devtools) => {
          console.log("!!!debug", "devtools var", devtools);
          const map = {
            ...devtools,
            [msg.tabId]: port,
          };
          console.log("!!!debug", "mapp", map);
          setVariable(Variable.DEVTOOLS, map);
        });
      }
    });

    port.onDisconnect.addListener(function () {
      getVariable<DevtoolsMap>(Variable.DEVTOOLS, {}).then((devtools) => {
        const tabId = Object.keys(devtools).find((tabId) => devtools[tabId] === port);
        if (tabId) {
          delete devtools[tabId];
          setVariable(Variable.DEVTOOLS, devtools);
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
  getVariable<DevtoolsMap>(Variable.DEVTOOLS, {}).then((devtools) => {
    const port = devtools[tabId];
    if (port) {
      port.postMessage(message);
    }
  });
};
