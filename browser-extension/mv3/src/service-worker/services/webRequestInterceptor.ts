import { RuleType } from "common/types";
import { matchRuleWithRequest } from "../../common/ruleMatcher";
import ruleExecutionHandler from "./ruleExecutionHandler";
import rulesStorageService from "../../rulesStorageService";
import { isUrlInBlockList, isExtensionEnabled } from "../../utils";
import { Variable, onVariableChange } from "../variable";

let webAppPort: chrome.runtime.Port | null = null;
let webAppPortTabId: number | null = null;
const interceptedRequestLogs: Record<string, any> = {};

const onBeforeRequest = async (details: chrome.webRequest.WebRequestBodyDetails) => {
  // @ts-ignore
  if (details?.documentLifecycle !== "active") {
    return;
  }

  let isMainFrameRequest = details.type === "main_frame" ? true : false;

  if ((await isUrlInBlockList(details.initiator)) || (await isUrlInBlockList(details.url))) {
    return;
  }

  if (webAppPort) {
    interceptedRequestLogs[details.requestId] = details;
  }

  rulesStorageService.getEnabledRules().then((enabledRules) => {
    enabledRules.forEach((rule) => {
      switch (rule.ruleType) {
        case RuleType.REDIRECT:
        case RuleType.REPLACE:
        case RuleType.QUERYPARAM:
        case RuleType.CANCEL:
        case RuleType.DELAY:
          const { isApplied } = matchRuleWithRequest(rule, {
            url: details.url,
            method: details.method,
            type: details.type as any,
            initiator: details.initiator,
          });
          if (isApplied) {
            ruleExecutionHandler.onRuleExecuted(rule, details, isMainFrameRequest);
          }
          break;
        default:
          break;
      }
    });
  });
};

const onBeforeSendHeaders = async (details: chrome.webRequest.WebRequestHeadersDetails) => {
  let isMainFrameRequest = details.type === "main_frame" ? true : false;

  if ((await isUrlInBlockList(details.initiator)) || (await isUrlInBlockList(details.url))) {
    return;
  }

  if (webAppPort && interceptedRequestLogs[details.requestId]) {
    interceptedRequestLogs[details.requestId].requestHeaders = details.requestHeaders;
  }

  rulesStorageService.getEnabledRules().then((enabledRules) => {
    enabledRules.forEach((rule) => {
      switch (rule.ruleType) {
        case RuleType.HEADERS:
        case RuleType.USERAGENT:
          // TODO: Match only incase of any request header pair
          const { isApplied, matchedPair } = matchRuleWithRequest(rule, {
            url: details.url,
            method: details.method,
            type: details.type as any,
            initiator: details.initiator,
          });
          if (isApplied && matchedPair.modifications?.Request && matchedPair.modifications?.Request?.length > 0) {
            ruleExecutionHandler.onRuleExecuted(rule, details, isMainFrameRequest);
          }
          break;
        default:
          // Do nothing
          break;
      }
    });
  });
};

const onHeadersReceived = async (details: chrome.webRequest.WebResponseHeadersDetails) => {
  let isMainFrameRequest = details.type === "main_frame" ? true : false;

  if ((await isUrlInBlockList(details.initiator)) || (await isUrlInBlockList(details.url))) {
    return;
  }

  if (webAppPort && interceptedRequestLogs[details.requestId]) {
    interceptedRequestLogs[details.requestId] = {
      ...interceptedRequestLogs[details.requestId],
      details,
    };

    sendInterceptedLog(interceptedRequestLogs[details.requestId]);

    delete interceptedRequestLogs[details.requestId];
  }

  rulesStorageService.getEnabledRules().then((enabledRules) => {
    enabledRules.forEach((rule) => {
      switch (rule.ruleType) {
        case RuleType.HEADERS:
          // TODO: Match only incase of any response header pair
          const { isApplied, matchedPair } = matchRuleWithRequest(rule, {
            url: details.url,
            method: details.method,
            type: details.type as any,
            initiator: details.initiator,
          });
          if (isApplied && matchedPair.modifications?.Response && matchedPair.modifications?.Response?.length > 0) {
            ruleExecutionHandler.onRuleExecuted(rule, details, isMainFrameRequest);
          }
          break;
        default:
          break;
      }
    });
  });
};

const addListeners = () => {
  //@ts-ignore
  if (!chrome.webRequest.onBeforeRequest.hasListener(onBeforeRequest)) {
    const onBeforeRequestOptions = ["requestBody"];
    //@ts-ignore
    chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, { urls: ["<all_urls>"] }, onBeforeRequestOptions);
  }

  //@ts-ignore
  if (!chrome.webRequest.onBeforeSendHeaders.hasListener(onBeforeSendHeaders)) {
    var onBeforeSendHeadersOptions = ["requestHeaders"];

    chrome.webRequest.onBeforeSendHeaders.addListener(
      //@ts-ignore
      onBeforeSendHeaders,
      { urls: ["<all_urls>"] },
      onBeforeSendHeadersOptions
    );
  }

  //@ts-ignore
  if (!chrome.webRequest.onHeadersReceived.hasListener(onHeadersReceived)) {
    var onHeadersReceivedOptions = ["responseHeaders"];

    chrome.webRequest.onHeadersReceived.addListener(
      //@ts-ignore
      onHeadersReceived,
      { urls: ["<all_urls>"] },
      onHeadersReceivedOptions
    );
  }
};

const removeListeners = () => {
  //@ts-ignore
  chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);
  //@ts-ignore
  chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
  //@ts-ignore
  chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived);
};

const sendInterceptedLog = (requestDetails: any) => {
  webAppPort?.postMessage({ action: "webRequestIntercepted", requestDetails });
};

export const startSendingInterceptedLogs = (tabId: chrome.tabs.Tab["id"]) => {
  console.log("!!!debug", "startSendingInterceptedLogs");
  if (!webAppPort) {
    webAppPort = chrome.tabs.connect(tabId, { name: "rq-web-request-interceptor" });
    webAppPortTabId = tabId;
  }

  chrome.tabs.onRemoved.addListener((id) => {
    if (webAppPortTabId === id) {
      stopSendingInterceptedLogs();
    }
  });
};

export const stopSendingInterceptedLogs = () => {
  if (webAppPort) {
    webAppPort.disconnect();
    webAppPort = null;
  }
};

export const initWebRequestInterceptor = () => {
  isExtensionEnabled().then((extensionStatus) => {
    if (extensionStatus) {
      addListeners();
    }
  });

  onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, (extensionStatus) => {
    if (extensionStatus) {
      addListeners();
    } else {
      removeListeners();
    }
  });
};
