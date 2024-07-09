import { RuleType } from "common/types";
import { matchRuleWithRequest } from "../../common/ruleMatcher";
import ruleExecutionHandler from "./ruleExecutionHandler";
import rulesStorageService from "../../rulesStorageService";
import { isUrlInBlockList } from "../../utils";

const onBeforeRequest = async (details: chrome.webRequest.WebRequestBodyDetails) => {
  // @ts-ignore
  if (details?.documentLifecycle !== "active") {
    return;
  }

  let isMainFrameRequest = details.type === "main_frame" ? true : false;

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

export const initWebRequestInterceptor = () => {
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
    var onHeadersReceivedOptions = ["responseHeaders"];

    chrome.webRequest.onHeadersReceived.addListener(
      //@ts-ignore
      onHeadersReceived,
      { urls: ["<all_urls>"] },
      onHeadersReceivedOptions
    );
  }
};
