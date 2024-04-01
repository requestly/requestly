import { PUBLIC_NAMESPACE } from "common/constants";

((namespace) => {
  window[namespace] = window[namespace] || {};
  window[namespace].responseRules = [];
  window[namespace].requestRules = {};
  let isDebugMode = false;

  // Some frames are sandboxes and throw DOMException when accessing localStorage
  try {
    isDebugMode = window && window.localStorage && localStorage.isDebugMode;
  } catch (e) {}

  const getAbsoluteUrl = (url) => {
    const dummyLink = document.createElement("a");
    dummyLink.href = url;
    return dummyLink.href;
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

  const matchSourceUrl = (sourceObject, url) => {
    const extractUrlComponent = (url, key) => {
      const urlObj = new URL(url);

      switch (key) {
        case "Url":
          return url;
        case "host":
          return urlObj.host;
        case "path":
          return urlObj.pathname;
        default:
          return null;
      }
    };

    const checkRegexMatch = (regexString, inputString) => {
      const toRegex = (regexStr) => {
        const matchRegExp = regexStr.match(new RegExp("^/(.+)/(|i|g|ig|gi)$"));

        if (!matchRegExp) {
          return null;
        }

        try {
          return new RegExp(matchRegExp[1], matchRegExp[2]);
        } catch {
          return null;
        }
      };

      if (!regexString.startsWith("/")) {
        regexString = `/${regexString}/`; // Keeping enclosing slashes for regex as optional
      }

      const regex = toRegex(regexString);
      return regex?.test(inputString);
    };

    const checkWildCardMatch = (wildCardString, inputString) => {
      const regexString = "/^" + wildCardString.replaceAll("*", ".*") + "$/";
      return checkRegexMatch(regexString, inputString);
    };

    const urlComponent = extractUrlComponent(url, sourceObject.key);
    const value = sourceObject.value;

    if (!urlComponent) {
      return false;
    }

    switch (sourceObject.operator) {
      case "Equals":
        if (value === urlComponent) {
          return true;
        }
        break;

      case "Contains":
        if (urlComponent.includes(value)) {
          return true;
        }
        break;

      case "Matches": {
        return checkRegexMatch(value, urlComponent);
      }

      case "Wildcard_Matches": {
        return checkWildCardMatch(value, urlComponent);
      }
    }

    return false;
  };

  const isResponseRuleApplicableOnUrl = (url) => {
    return !!getMatchedResponseRule(url);
  };

  const isRequestRuleApplicableOnUrl = (url) => {
    return window[namespace].requestRules.hasOwnProperty(getAbsoluteUrl(url));
  };

  /**
   * @param {Object} json
   * @param {String} path -> "a", "a.b", "a.0.b (If a is an array containing list of objects"
   * Also copied in shared/utils.js for the sake of testing
   */
  const traverseJsonByPath = (jsonObject, path) => {
    if (!path) return;

    const pathParts = path.split(".");

    try {
      // Reach the last node but not the leaf node.
      for (i = 0; i < pathParts.length - 1; i++) {
        jsonObject = jsonObject[pathParts[i]];
      }

      return jsonObject[pathParts[pathParts.length - 1]];
    } catch (e) {
      /* Do nothing */
    }
  };

  const isRequestPayloadFilterApplicable = ({ requestData, method }, sourceFilters) => {
    const sourceFiltersArray = Array.isArray(sourceFilters) ? sourceFilters : [sourceFilters];

    return (
      !sourceFiltersArray.length ||
      sourceFiltersArray.some((sourceFilter) => {
        if (sourceFilter?.requestMethod?.length && !sourceFilter.requestMethod.includes(method)) {
          return false;
        }

        let requestPayloadFilter = sourceFilter?.requestPayload;

        if (!requestPayloadFilter) return true;
        if (typeof requestPayloadFilter === "object" && Object.keys(requestPayloadFilter).length === 0) return true;

        // We only allow request payload targeting when requestData is JSON
        if (!requestData || typeof requestData !== "object") return false;
        if (Object.keys(requestData).length === 0) return false;

        requestPayloadFilter = requestPayloadFilter || {};
        const targettedKey = requestPayloadFilter?.key;
        const targetedValue = requestPayloadFilter?.value;

        // tagettedKey is the json path e.g. a.b.0.c
        if (targettedKey && typeof targetedValue !== undefined) {
          const valueInRequestData = traverseJsonByPath(requestData, targettedKey);
          const operator = requestPayloadFilter?.operator;

          if (!operator || operator === "Equals") {
            return valueInRequestData === targetedValue;
          }

          if (operator === "Contains") {
            return valueInRequestData.includes(targetedValue);
          }
        }

        return false;
      })
    );
  };

  const getMatchedResponseRule = (url) => {
    return window[namespace].responseRules?.findLast((rule) => matchSourceUrl(rule.source, url));
  };

  const getMatchedRequestRule = (url) => {
    return window[namespace].requestRules?.[getAbsoluteUrl(url)];
  };

  const shouldServeResponseWithoutRequest = (responseModification) => {
    return responseModification.type === "static" && responseModification.serveWithoutRequest;
  };

  const getFunctionFromCode = (code) => {
    return new Function("args", `return (${code})(args);`);
  };

  const getCustomRequestBody = (requestRuleData, args) => {
    let requestBody;
    if (requestRuleData.request.type === "static") {
      requestBody = requestRuleData.request.value;
    } else {
      requestBody = getFunctionFromCode(requestRuleData.request.value)(args);
    }

    if (typeof requestBody !== "object" || isNonJsonObject(requestBody)) {
      return requestBody;
    }

    return JSON.stringify(requestBody);
  };

  /**
   * @param A string which might be JSON String or normal String
   */
  const jsonifyValidJSONString = (mightBeJSONString) => {
    if (typeof mightBeJSONString !== "string") return mightBeJSONString;

    try {
      return JSON.parse(mightBeJSONString);
    } catch (e) {
      /* Do Nothing. Unable to parse the param value */
    }

    return mightBeJSONString;
  };

  const isJSON = (data) => {
    const parsedJson = jsonifyValidJSONString(data);
    return parsedJson !== data; // if data is not a JSON, jsonifyValidJSONString() returns same value
  };

  /**
   * @param  url
   * Does not handle duplicate query params for now
   */
  const convertSearchParamsToJSON = (url) => {
    const result = {};

    if (!url || url === "?" || url.indexOf("?") === -1) {
      return result;
    }

    // https://stackoverflow.com/a/50147341/816213
    // (URL decoding is already handled in URLSearchParams)
    const searchParamsString = url.split("?")[1];
    const paramsObject = Object.fromEntries(new URLSearchParams(searchParamsString));

    // Traverse paramsObject to convert JSON strings into JSON object
    for (let paramName in paramsObject) {
      const paramValue = paramsObject[paramName];
      paramsObject[paramName] = jsonifyValidJSONString(paramValue);
    }

    return paramsObject;
  };

  const notifyResponseRuleApplied = (message) => {
    window.top.postMessage(
      {
        source: "requestly:client",
        action: "response_rule_applied",
        ruleId: message.ruleDetails.id,
        requestDetails: message["requestDetails"],
      },
      window.location.href
    );
  };

  const notifyRequestRuleApplied = (message) => {
    window.top.postMessage(
      {
        source: "requestly:client",
        action: "request_rule_applied",
        ruleId: message.ruleDetails.id,
        requestDetails: message["requestDetails"],
      },
      window.location.href
    );
  };

  const isPromise = (obj) =>
    !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";

  const isContentTypeJSON = (contentType) => !!contentType?.includes("application/json");

  /**
   * ********** Within Context Functions end here *************
   */

  // Intercept XMLHttpRequest
  const onReadyStateChange = async function () {
    if (this.readyState === this.HEADERS_RECEIVED || this.readyState === this.DONE) {
      let url;

      if (isResponseRuleApplicableOnUrl(this.responseURL)) {
        url = this.responseURL;
      } else if (isResponseRuleApplicableOnUrl(this.requestURL)) {
        url = this.requestURL;
      } else {
        return;
      }

      const responseRuleData = getMatchedResponseRule(url);
      const { response: responseModification, source } = responseRuleData;
      const responseType = this.responseType;
      const contentType = this.getResponseHeader("content-type");

      isDebugMode &&
        console.log("RQ", "Inside the XHR onReadyStateChange block for url", {
          url,
          xhr: this,
        });

      // If requestPayloadTargeting is defined and doesn't match then don't override the response getter
      if (
        !isRequestPayloadFilterApplicable(
          {
            requestData: jsonifyValidJSONString(this.requestData),
            method: this.method,
          },
          source?.filters
        )
      ) {
        return;
      }

      if (this.readyState === this.HEADERS_RECEIVED) {
        // For network failures, responseStatus=0 but we still return customResponse with status=200
        const responseStatus = parseInt(responseModification.statusCode || this.status) || 200;
        const responseStatusText = responseModification.statusText || this.statusText;

        Object.defineProperty(this, "status", {
          get: () => responseStatus,
        });

        Object.defineProperty(this, "statusText", {
          get: () => responseStatusText,
        });
      }

      if (this.readyState === this.DONE) {
        let customResponse =
          responseModification.type === "code"
            ? getFunctionFromCode(responseRuleData.response.value)({
                method: this.method,
                url,
                requestHeaders: this.requestHeaders,
                requestData: jsonifyValidJSONString(this.requestData),
                responseType: contentType,
                response: this.response,
                responseJSON: jsonifyValidJSONString(this.response),
              })
            : responseModification.value;

        // Convert customResponse back to rawText
        // response.value is String and evaluator method might return string/object
        if (isPromise(customResponse)) {
          customResponse = await customResponse;
        }

        const isUnsupportedResponseType = responseType && !["json", "text"].includes(responseType);

        // We do not support statically modifying responses of type - blob, arraybuffer, document etc.
        if (responseModification.type === "static" && isUnsupportedResponseType) {
          customResponse = this.response;
        }

        if (
          !isUnsupportedResponseType &&
          typeof customResponse === "object" &&
          !(customResponse instanceof Blob) &&
          (responseType === "json" || isContentTypeJSON(contentType))
        ) {
          customResponse = JSON.stringify(customResponse);
        }

        Object.defineProperty(this, "response", {
          get: function () {
            if (responseModification.type === "static" && responseType === "json") {
              if (typeof customResponse === "object") {
                return customResponse;
              }

              return jsonifyValidJSONString(customResponse);
            }

            return customResponse;
          },
        });

        if (responseType === "" || responseType === "text") {
          Object.defineProperty(this, "responseText", {
            get: function () {
              return customResponse;
            },
          });
        }

        const requestDetails = {
          url,
          method: this.method,
          type: "xmlhttprequest",
          timeStamp: Date.now(),
        };

        notifyResponseRuleApplied({ ruleDetails: responseRuleData, requestDetails });
      }
    }
  };

  const resolveXHR = (xhr, responseData) => {
    Object.defineProperty(xhr, "readyState", { writable: true });
    const updateReadyState = (readyState) => {
      xhr.readyState = readyState;
      xhr.dispatchEvent(new CustomEvent("readystatechange"));
    };
    const dispatchProgressEvent = (type) => {
      xhr.dispatchEvent(new ProgressEvent(type));
    };

    dispatchProgressEvent("loadstart");

    // update response headers
    const contentType = isJSON(responseData) ? "application/json" : "text/plain";
    xhr.getResponseHeader = (key) => {
      if (key.toLowerCase() === "content-type") {
        return contentType;
      }
      return null;
    };
    updateReadyState(xhr.HEADERS_RECEIVED);

    // mark resolved
    updateReadyState(xhr.DONE);
    dispatchProgressEvent("load");
    dispatchProgressEvent("loadend");
  };

  const XHR = XMLHttpRequest;
  XMLHttpRequest = function () {
    const xhr = new XHR();
    xhr.addEventListener("readystatechange", onReadyStateChange.bind(xhr), false);
    return xhr;
  };
  XMLHttpRequest.prototype = XHR.prototype;
  Object.entries(XHR).map(([key, val]) => {
    XMLHttpRequest[key] = val;
  });

  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.method = method;
    this.requestURL = url;
    open.apply(this, arguments);
  };

  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (data) {
    this.requestData = data;

    const requestRule = getMatchedRequestRule(this.requestURL);
    if (requestRule) {
      this.requestData = getCustomRequestBody(requestRule.request, {
        method: this.method,
        url: this.requestURL,
        body: data,
        bodyAsJson: jsonifyValidJSONString(data),
      });

      notifyRequestRuleApplied({
        ruleDetails: requestRule,
        requestDetails: {
          url: this.requestURL,
          method: this.method,
          type: "xmlhttprequest",
          timeStamp: Date.now(),
        },
      });
    }

    this.responseRule = getMatchedResponseRule(this.requestURL);

    if (this.responseRule && shouldServeResponseWithoutRequest(this.responseRule.response)) {
      resolveXHR(this, this.responseRule.response.value);
    } else {
      send.apply(this, arguments);
    }
  };

  let setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    this.requestHeaders = this.requestHeaders || {};
    this.requestHeaders[header] = value;
    setRequestHeader.apply(this, arguments);
  };

  // Intercept fetch API
  const _fetch = fetch;
  fetch = async (resource, initOptions = {}) => {
    const getOriginalResponse = () => _fetch(resource, initOptions);

    let request;

    if (resource instanceof Request) {
      request = resource.clone();
    } else {
      request = new Request(resource.toString(), initOptions);
    }

    let url = getAbsoluteUrl(request.url);
    const method = request.method;

    // Request body can be sent only for request methods other than GET and HEAD.
    const canRequestBodyBeSent = !["GET", "HEAD"].includes(method);

    const requestRuleData = canRequestBodyBeSent && getMatchedRequestRule(url);

    if (requestRuleData) {
      const originalRequestBody = await request.text();
      const requestBody =
        getCustomRequestBody(requestRuleData, {
          method,
          url,
          body: originalRequestBody,
          bodyAsJson: jsonifyValidJSONString(originalRequestBody),
        }) || {};

      request = new Request(request.url, {
        method,
        body: requestBody,
        headers: request.headers,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        integrity: request.integrity,
      });

      notifyRequestRuleApplied({
        ruleDetails: requestRuleData,
        requestDetails: {
          url,
          method,
          type: "fetch",
          timeStamp: Date.now(),
        },
      });
    }

    let requestData;
    if (canRequestBodyBeSent) {
      requestData = jsonifyValidJSONString(await request.clone().text()); // cloning because the request will be used to make API call
    }

    let responseHeaders;
    let fetchedResponse;
    let exceptionCaught;

    const responseRule = getMatchedResponseRule(url);

    if (responseRule && shouldServeResponseWithoutRequest(responseRule.response)) {
      const contentType = isJSON(responseRule.response.value) ? "application/json" : "text/plain";
      responseHeaders = new Headers({ "content-type": contentType });
    } else {
      try {
        if (requestRuleData) {
          fetchedResponse = await _fetch(request);
        } else {
          fetchedResponse = await getOriginalResponse();
        }

        if (!responseRule) {
          return fetchedResponse;
        }

        responseHeaders = fetchedResponse?.headers;
      } catch (error) {
        exceptionCaught = error;
      }
    }

    if (fetchedResponse && isResponseRuleApplicableOnUrl(fetchedResponse.url)) {
      url = fetchedResponse.url; // final URL obtained after any redirects
    } else if (isResponseRuleApplicableOnUrl(request.url)) {
      url = request.url;
    } else {
      if (exceptionCaught) {
        return Promise.reject(exceptionCaught);
      }
      return fetchedResponse;
    }

    const responseRuleData = getMatchedResponseRule(url);

    if (fetchedResponse?.status === 204) {
      // Return the same response when status is 204. fetch doesn't allow to create new response with empty body
      return fetchedResponse;
    }

    isDebugMode &&
      console.log("RQ", "Inside the fetch block for url", {
        url,
        resource,
        initOptions,
        fetchedResponse,
      });

    if (method === "POST") {
      requestData = jsonifyValidJSONString(await request.text());
    } else {
      requestData = convertSearchParamsToJSON(url);
    }

    if (!isRequestPayloadFilterApplicable({ requestData, method }, responseRuleData.source?.filters)) {
      return fetchedResponse;
    }

    let customResponse;

    if (responseRuleData.response.type === "code") {
      const requestHeaders =
        request.headers &&
        Array.from(request.headers).reduce((obj, [key, val]) => {
          obj[key] = val;
          return obj;
        }, {});

      let evaluatorArgs = {
        method,
        url,
        requestHeaders,
        requestData,
      };

      if (fetchedResponse) {
        const fetchedResponseData = await fetchedResponse.text();
        const responseType = fetchedResponse.headers.get("content-type");
        const fetchedResponseDataAsJson = jsonifyValidJSONString(fetchedResponseData);

        evaluatorArgs = {
          ...evaluatorArgs,
          responseType,
          response: fetchedResponseData,
          responseJSON: fetchedResponseDataAsJson,
        };
      }

      customResponse = getFunctionFromCode(responseRuleData.response.value)(evaluatorArgs);

      // evaluator might return us Object but response.value is string
      // So make the response consistent by converting to JSON String and then create the Response object
      if (isPromise(customResponse)) {
        customResponse = await customResponse;
      }

      if (typeof customResponse === "object" && isContentTypeJSON(evaluatorArgs?.responseType)) {
        customResponse = JSON.stringify(customResponse);
      }
    } else {
      customResponse = responseRuleData.response.value;
    }

    const requestDetails = {
      url,
      method,
      type: "fetch",
      timeStamp: Date.now(),
    };

    notifyResponseRuleApplied({ ruleDetails: responseRuleData, requestDetails });

    // For network failures, fetchedResponse is undefined but we still return customResponse with status=200
    const finalStatusCode = parseInt(responseRuleData.response.statusCode || fetchedResponse?.status) || 200;
    const requiresNullResponseBody = [204, 205, 304].includes(finalStatusCode);

    return new Response(requiresNullResponseBody ? null : new Blob([customResponse]), {
      // For network failures, fetchedResponse is undefined but we still return customResponse with status=200
      status: finalStatusCode,
      statusText: responseRuleData.response.statusText || fetchedResponse?.statusText,
      headers: responseHeaders,
    });
  };
})(PUBLIC_NAMESPACE);
