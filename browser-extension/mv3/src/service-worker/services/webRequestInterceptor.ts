import { getEnabledRules } from "common/rulesStore";
import { RuleType } from "common/types";
import { matchSourceUrl } from "./ruleMatcher";
import ruleExecutionHandler from "./ruleExecutionHandler";

const onBeforeRequest = (details: chrome.webRequest.WebRequestBodyDetails) => {
  // @ts-ignore
  if (details?.documentLifecycle !== "active") {
    return;
  }

  getEnabledRules().then((enabledRules) => {
    let isMainFrameRequest = details.type === "main_frame" ? true : false;

    enabledRules.forEach((rule) => {
      switch (rule.ruleType) {
        case RuleType.REDIRECT:
        case RuleType.REPLACE:
        case RuleType.QUERYPARAM:
        case RuleType.CANCEL:
        case RuleType.DELAY:
          rule.pairs.forEach((pair) => {
            if (matchSourceUrl(pair.source, details.url)) {
              ruleExecutionHandler.onRuleExecuted(rule, details, isMainFrameRequest);
            }
          });
          break;
        default:
          break;
      }
    });
  });
};

const onBeforeSendHeaders = (details: chrome.webRequest.WebRequestHeadersDetails) => {
  getEnabledRules().then((enabledRules) => {
    enabledRules.forEach((rule) => {
      switch (rule.ruleType) {
        case RuleType.HEADERS:
        case RuleType.USERAGENT:
          rule.pairs.forEach((pair) => {
            // Match only in case of Request Modifications
            // TODO: Fix for useragent rule. Should only apply on main frame requests
            // @ts-ignore
            if (pair.modifications?.Request && pair.modifications?.Request?.length > 0) {
              if (matchSourceUrl(pair.source, details.url)) {
                ruleExecutionHandler.onRuleExecuted(rule, details);
              }
            }
          });
          break;
        default:
          // Do nothing
          break;
      }
    });
  });
};

const onHeadersReceived = (details: chrome.webRequest.WebResponseHeadersDetails) => {
  getEnabledRules().then((enabledRules) => {
    enabledRules.forEach((rule) => {
      switch (rule.ruleType) {
        case RuleType.HEADERS:
          rule.pairs.forEach((pair) => {
            // @ts-ignore
            if (pair.modifications?.Response && pair.modifications?.Response?.length > 0) {
              if (matchSourceUrl(pair.source, details.url)) {
                ruleExecutionHandler.onRuleExecuted(rule, details);
              }
            }
          });
          break;
        default:
          break;
      }
    });
  });
};

export const initWebRequestInterceptor = () => {
  if (!chrome.webRequest.onBeforeRequest.hasListener(onBeforeRequest)) {
    chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, { urls: ["<all_urls>"] });
  }

  if (!chrome.webRequest.onBeforeSendHeaders.hasListener(onBeforeSendHeaders)) {
    var onBeforeSendHeadersOptions = ["requestHeaders"];

    chrome.webRequest.onBeforeSendHeaders.addListener(
      onBeforeSendHeaders,
      { urls: ["<all_urls>"] },
      onBeforeSendHeadersOptions
    );
  }

  if (!chrome.webRequest.onHeadersReceived.hasListener(onHeadersReceived)) {
    var onHeadersReceivedOptions = ["responseHeaders"];

    chrome.webRequest.onHeadersReceived.addListener(
      onHeadersReceived,
      { urls: ["<all_urls>"] },
      onHeadersReceivedOptions
    );
  }
};
