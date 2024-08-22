import { EXTENSION_MESSAGES, PUBLIC_NAMESPACE } from "common/constants";
import { matchRuleWithRequest, matchSourceUrl } from "../../common/ruleMatcher";
import { SourceKey, SourceOperator } from "common/types";

let logShown = false;

export const getFunctionFromCode = (code, ruleType) => {
  try {
    return generateUserFunctionWithSharedState(code);
  } catch (e) {
    notifyOnErrorOccurred({
      initiator: location.origin,
      url: location.href,
    }).then(() => {
      if (!logShown) {
        logShown = true;
        console.log(
          `%cRequestly%c Please reload the page for ${ruleType} rule to take effect`,
          "color: #3c89e8; padding: 1px 5px; border-radius: 4px; border: 1px solid #91caff;",
          "color: red; font-style: italic"
        );
      }
    });
    return () => {};
  }
};

const generateUserFunctionWithSharedState = function (functionStringEscaped) {
  const SHARED_STATE_VAR_NAME = "$sharedState";

  let sharedState;
  try {
    sharedState = window.top[PUBLIC_NAMESPACE]?.sharedState ?? {};
  } catch (e) {
    sharedState = window[PUBLIC_NAMESPACE]?.sharedState ?? {};
  }

  const { func: generatedFunction, updatedSharedState } = new Function(
    `${SHARED_STATE_VAR_NAME}`,
    `return { func: ${functionStringEscaped}, updatedSharedState: ${SHARED_STATE_VAR_NAME}}`
  )(sharedState);

  return generatedFunction;
};

const isNonJsonObject = (obj) => {
  return [
    Blob,
    ArrayBuffer,
    Object.getPrototypeOf(Uint8Array), // TypedArray instance type
    DataView,
    FormData,
    URLSearchParams,
  ].some((nonJsonType) => obj instanceof nonJsonType);
};

export const getCustomRequestBody = (requestRule, args) => {
  const modification = requestRule.pairs[0].request;
  let requestBody;
  if (modification.type === "static") {
    requestBody = modification.value;
  } else {
    requestBody = getFunctionFromCode(modification.value, "request")(args);
  }

  if (typeof requestBody !== "object" || isNonJsonObject(requestBody)) {
    return requestBody;
  }

  return JSON.stringify(requestBody);
};

const postMessageAndWaitForAck = async (message, action) => {
  window.postMessage(
    {
      ...message,
      action,
      source: "requestly:client",
    },
    window.location.href
  );

  let ackHandler;

  const ackAction = `${action}:processed`;

  return Promise.race([
    new Promise((resolve) => setTimeout(resolve, 2000)),
    new Promise((resolve) => {
      ackHandler = (event) => {
        if (event.data.action === ackAction) {
          resolve();
        }
      };
      window.addEventListener("message", ackHandler);
    }),
  ]).finally(() => {
    window.removeEventListener("message", ackHandler);
  });
};

export const notifyOnBeforeRequest = async (requestDetails) => {
  return postMessageAndWaitForAck({ requestDetails }, "onBeforeAjaxRequest");
};

export const notifyOnErrorOccurred = async (requestDetails) => {
  return postMessageAndWaitForAck({ requestDetails }, "onErrorOccurred");
};

export const isPromise = (obj) =>
  !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";

/**
 * @param mightBeJSONString string which might be JSON String or normal String
 * @param doStrictCheck should return empty JSON if invalid JSON string
 */
export const jsonifyValidJSONString = (mightBeJSONString, doStrictCheck) => {
  const defaultValue = doStrictCheck ? {} : mightBeJSONString;

  if (typeof mightBeJSONString !== "string") {
    return defaultValue;
  }

  try {
    return JSON.parse(mightBeJSONString);
  } catch (e) {
    /* Do Nothing. Unable to parse the param value */
  }

  return defaultValue;
};

export const isJSON = (data) => {
  const parsedJson = jsonifyValidJSONString(data);
  return parsedJson !== data; // if data is not a JSON, jsonifyValidJSONString() returns same value
};

export const notifyResponseRuleApplied = (message) => {
  window.top.postMessage(
    {
      source: "requestly:client",
      action: "response_rule_applied",
      rule: message.ruleDetails,
      requestDetails: message["requestDetails"],
    },
    window.location.href
  );
};

export const notifyRequestRuleApplied = (message) => {
  window.top.postMessage(
    {
      source: "requestly:client",
      action: "request_rule_applied",
      rule: message.ruleDetails,
      requestDetails: message["requestDetails"],
    },
    window.location.href
  );
};

export const sendCacheSharedStateMessage = () => {
  window.top.postMessage(
    {
      source: "requestly:client",
      action: EXTENSION_MESSAGES.CACHE_SHARED_STATE,
      sharedState: window[PUBLIC_NAMESPACE]?.sharedState,
    },
    window.location.href
  );
};

export const getAbsoluteUrl = (url) => {
  const dummyLink = document.createElement("a");
  dummyLink.href = url;
  return dummyLink.href;
};

export const getMatchedRequestRule = (requestDetails) => {
  return window[PUBLIC_NAMESPACE]?.requestRules?.findLast(
    (rule) =>
      // TODO: Move ruleMatcher outside of service worker
      matchRuleWithRequest(rule, requestDetails)?.isApplied === true
  );
};

export const getMatchedResponseRule = (requestDetails) => {
  return window[PUBLIC_NAMESPACE]?.responseRules?.findLast(
    (rule) =>
      // TODO: Move ruleMatcher outside of service worker
      // TODO: Add graphql requestData matching in matchRuleWithRequest too
      matchRuleWithRequest(rule, requestDetails)?.isApplied === true
  );
};

export const getMatchedDelayRule = (requestDetails) => {
  if (!window[PUBLIC_NAMESPACE]?.delayRules) {
    return null;
  }

  for (const rule of window[PUBLIC_NAMESPACE]?.delayRules) {
    const { isApplied, matchedPair } = matchRuleWithRequest(rule, requestDetails);

    return matchedPair;
  }

  return null;
};

export const shouldServeResponseWithoutRequest = (responseRule) => {
  const responseModification = responseRule.pairs[0].response;
  return responseModification.type === "static" && responseModification.serveWithoutRequest;
};

export const isContentTypeJSON = (contentType) => !!contentType?.includes("application/json");

export const applyDelay = async (delay) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};
