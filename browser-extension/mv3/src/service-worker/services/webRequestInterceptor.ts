import { RuleType } from "common/types";
import { matchRuleWithRequest } from "../../common/ruleMatcher";
import ruleExecutionHandler from "./ruleExecutionHandler";
import rulesStorageService from "../../rulesStorageService";
import { isUrlInBlockList, isExtensionEnabled } from "../../utils";
import { onVariableChange, Variable } from "../variable";
import { apiRequestCorrelationManager } from "./apiClient/ApiRequestCorrelationManager";
import { REQUESTLY_ID_HEADER } from "./apiClient";

const onBeforeRequest = async (details: chrome.webRequest.WebRequestBodyDetails) => {
  // Firefox and Safari do not have documentLifecycle
  // @ts-ignore
  if (details?.documentLifecyle) {
    // @ts-ignore
    if (details?.documentLifecycle !== "active" && details?.documentLifecycle !== "prerender") {
      return;
    }
  }

  let isMainOrPrerenderedFrame =
    //@ts-ignore
    details.type === "main_frame" || details.documentLifecycle === "prerender" ? true : false;

  if ((await isUrlInBlockList(details.initiator)) || (await isUrlInBlockList(details.url))) {
    return;
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
            ruleExecutionHandler.onRuleExecuted(rule, details, isMainOrPrerenderedFrame);
          }
          break;
        default:
          break;
      }
    });
  });
};

const onBeforeSendHeaders = async (details: chrome.webRequest.WebRequestHeadersDetails) => {
  let isMainOrPrerenderedFrame =
    details.type === "main_frame" || details.documentLifecycle === "prerender" ? true : false;

  if ((await isUrlInBlockList(details.initiator)) || (await isUrlInBlockList(details.url))) {
    return;
  }

  const rqId = details.requestHeaders.find((h) => h.name.toLowerCase() === REQUESTLY_ID_HEADER)?.value;
  if (rqId) {
    apiRequestCorrelationManager.linkWebRequestToRqId(details.requestId, rqId);
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
            ruleExecutionHandler.onRuleExecuted(rule, details, isMainOrPrerenderedFrame);
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
  apiRequestCorrelationManager.invokeHandler(details);
  let isMainOrPrerenderedFrame =
    //@ts-ignore
    details.type === "main_frame" || details.documentLifecycle === "prerender" ? true : false;

  if ((await isUrlInBlockList(details.initiator)) || (await isUrlInBlockList(details.url))) {
    return;
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
            ruleExecutionHandler.onRuleExecuted(rule, details, isMainOrPrerenderedFrame);
          }
          break;
        default:
          break;
      }
    });
  });
};

export const addListeners = () => {
  //@ts-ignore
  if (!chrome.webRequest.onBeforeRequest.hasListener(onBeforeRequest)) {
    //@ts-ignore
    chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, { urls: ["<all_urls>"] });
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
    var onHeadersReceivedOptions = ["responseHeaders", "extraHeaders"];

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
