RQ.RequestResponseRuleHandler = {};
RQ.RequestResponseRuleHandler.isInitialized = false;
RQ.RequestResponseRuleHandler.cachedResponseRuleIds = new Set();

RQ.RequestResponseRuleHandler.setup = () => {
  // TODO: store the extension status in background and watch for changes here
  chrome.runtime.sendMessage(
    {
      action: RQ.EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED,
    },
    (isExtensionEnabled) => {
      RQ.ClientUtils.executeJS(
        `
        window.${RQ.PUBLIC_NAMESPACE} = window.${RQ.PUBLIC_NAMESPACE} || {};
        window.${RQ.PUBLIC_NAMESPACE}.isExtensionEnabled = ${isExtensionEnabled};
      `,
        true
      );
    }
  );

  RQ.RulesStore.getRules().then((rules) => {
    const doRequestResponseRulesExist = rules.some((rule) => {
      return [RQ.RULE_TYPES.REQUEST, RQ.RULE_TYPES.RESPONSE].includes(rule.ruleType);
    });

    if (doRequestResponseRulesExist) {
      RQ.RequestResponseRuleHandler.init();
    }
  });

  RQ.RulesStore.onRuleOrGroupChange(() => {
    if (!RQ.RequestResponseRuleHandler.isInitialized) {
      RQ.RequestResponseRuleHandler.init();
    }
    RQ.RequestResponseRuleHandler.updateRulesCache();
  });
};

RQ.RequestResponseRuleHandler.init = function () {
  // we match request rules on client-side whereas response rules are still matched in background
  RQ.ClientUtils.executeJS(`(${RQ.ClientRuleMatcher.toString()})('${RQ.PUBLIC_NAMESPACE}')`);

  RQ.RequestResponseRuleHandler.updateRulesCache();

  window.addEventListener("message", function (event) {
    // We only accept messages from ourselves
    if (event.source !== window || event.data.from !== "requestly") {
      return;
    }

    if (event.data.type === "request_rule_applied") {
      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.NOTIFY_RULES_APPLIED,
        ruleIds: [event.data.id],
        modification: "modified request body",
        ...event.data.requestDetails,
      });
    } else if (event.data.type === "response_rule_applied") {
      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.NOTIFY_RULES_APPLIED,
        ruleIds: [event.data.id],
        modification: "modified response",
        ...event.data.requestDetails,
      });
    }
  });

  RQ.ClientUtils.executeJS(`(${this.interceptAJAXRequests.toString()})('${RQ.PUBLIC_NAMESPACE}')`);

  RQ.RequestResponseRuleHandler.isInitialized = true;
};

RQ.RequestResponseRuleHandler.cacheRequestRules = async () => {
  const requestRules = await RQ.RulesStore.getEnabledRules(RQ.RULE_TYPES.REQUEST);
  RQ.ClientUtils.executeJS(
    `
    window.${RQ.PUBLIC_NAMESPACE} = window.${RQ.PUBLIC_NAMESPACE} || {};
    window.${RQ.PUBLIC_NAMESPACE}.requestRules = ${JSON.stringify(requestRules)};
  `,
    true
  );
};

RQ.RequestResponseRuleHandler.cacheResponseRules = async () => {
  const responseRules = await RQ.RulesStore.getEnabledRules(RQ.RULE_TYPES.RESPONSE);
  RQ.ClientUtils.executeJS(
    `
    window.${RQ.PUBLIC_NAMESPACE} = window.${RQ.PUBLIC_NAMESPACE} || {};
    window.${RQ.PUBLIC_NAMESPACE}.responseRules = ${JSON.stringify(responseRules)};
  `,
    true
  );
};

RQ.RequestResponseRuleHandler.updateRulesCache = async () => {
  RQ.RequestResponseRuleHandler.cacheRequestRules();
  RQ.RequestResponseRuleHandler.cacheResponseRules();
};

/**
 * @param {*} namespace __REQUESTLY__
 * Do not refer other function/variables from this function.
 * This function will be injected in website and will run in different JS context.
 */

RQ.RequestResponseRuleHandler.interceptAJAXRequests = function (namespace) {
  window[namespace] = window[namespace] || {};
  window[namespace].requestRules = [];
  window[namespace].responseRules = [];
  let isDebugMode = false;

  // Some frames are sandboxes and throw DOMException when accessing localStorage
  try {
    isDebugMode = window && window.localStorage && localStorage.isDebugMode;
  } catch (e) {}

  const isExtensionEnabled = () => {
    return window[namespace].isExtensionEnabled ?? true;
  };

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

  const matchesSourceFilters = ({ requestData, method }, sourceFilters) => {
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

        // tagettedKey is the json path e.g. a.b.0.c
        if (targettedKey) {
          const valueInRequestData = traverseJsonByPath(requestData, targettedKey);
          return valueInRequestData == requestPayloadFilter?.value;
        }

        return false;
      })
    );
  };

  const matchRuleSource = ({ url, requestData, method }, rule) => {
    const modification = rule.pairs[0];
    const ruleSource = modification.source;

    return (
      window[namespace].matchSourceUrl(ruleSource, url) &&
      matchesSourceFilters({ requestData, method }, ruleSource?.filters)
    );
  };

  const getRequestRule = (url) => {
    if (!isExtensionEnabled()) {
      return null;
    }

    return window[namespace].requestRules.findLast((rule) =>
      window[namespace].matchSourceUrl(rule.pairs[0].source, url)
    );
  };

  const getResponseRule = ({ url, requestData, method }) => {
    if (!isExtensionEnabled()) {
      return null;
    }

    return window[namespace].responseRules.findLast((rule) => {
      return matchRuleSource({ url, requestData, method }, rule);
    });
  };

  const shouldServeResponseWithoutRequest = (responseRule) => {
    const responseModification = responseRule.pairs[0].response;
    return responseModification.type === "static" && responseModification.serveWithoutRequest;
  };

  const getFunctionFromCode = (code) => {
    return new Function("args", `return (${code})(args);`);
  };

  const getCustomRequestBody = (requestRule, args) => {
    const modification = requestRule.pairs[0].request;
    if (modification.type === "static") {
      requestBody = modification.value;
    } else {
      requestBody = getFunctionFromCode(modification.value)(args);
    }

    if (typeof requestBody !== "object" || isNonJsonObject(requestBody)) {
      return requestBody;
    }

    return JSON.stringify(requestBody);
  };

  /**
   * @param mightBeJSONString string which might be JSON String or normal String
   * @param doStrictCheck should return empty JSON if invalid JSON string
   */
  const jsonifyValidJSONString = (mightBeJSONString, doStrictCheck) => {
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

  const isJSON = (data) => {
    const parsedJson = jsonifyValidJSONString(data);
    return parsedJson !== data; // if data is not a JSON, jsonifyValidJSONString() returns same value
  };

  const notifyRequestRuleApplied = (message) => {
    window.postMessage(
      {
        from: "requestly",
        type: "request_rule_applied",
        id: message.ruleDetails.id,
        requestDetails: message["requestDetails"],
      },
      window.location.href
    );
  };

  const notifyResponseRuleApplied = (message) => {
    window.postMessage(
      {
        from: "requestly",
        type: "response_rule_applied",
        id: message.rule.id,
        requestDetails: message["requestDetails"],
      },
      window.location.href
    );
  };

  const isPromise = (obj) =>
    !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";

  const isContentTypeJSON = (contentType) => !!contentType?.includes("application/json");

  // Intercept XMLHttpRequest
  const onReadyStateChange = async function () {
    if (this.readyState === this.HEADERS_RECEIVED || this.readyState === this.DONE) {
      if (!this.responseRule) {
        return;
      }

      const responseModification = this.responseRule.pairs[0].response;
      const responseType = this.responseType;
      const contentType = this.getResponseHeader("content-type");

      isDebugMode &&
        console.log("RQ", "Inside the XHR onReadyStateChange block for url", {
          url: this.requestURL,
          xhr: this,
        });

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
            ? getFunctionFromCode(responseModification.value)({
                method: this.method,
                url: this.requestURL,
                requestHeaders: this.requestHeaders,
                requestData: jsonifyValidJSONString(this.requestData),
                responseType: contentType,
                response: this.response,
                responseJSON: jsonifyValidJSONString(this.response, true),
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
          url: this.requestURL,
          method: this.method,
          type: "xmlhttprequest",
          timeStamp: Date.now(),
        };

        notifyResponseRuleApplied({
          rule: this.responseRule,
          requestDetails,
        });
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
    this.requestURL = getAbsoluteUrl(url);
    open.apply(this, arguments);
  };

  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (data) {
    this.requestData = data;

    const requestRule = getRequestRule(this.requestURL);
    if (requestRule) {
      this.requestData = getCustomRequestBody(requestRule, {
        method: this.method,
        url: this.requestURL,
        body: data,
        bodyAsJson: jsonifyValidJSONString(data, true),
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

    this.responseRule = getResponseRule({
      url: this.requestURL,
      requestData: jsonifyValidJSONString(this.requestData),
      method: this.method,
    });

    if (this.responseRule && shouldServeResponseWithoutRequest(this.responseRule)) {
      resolveXHR(this, this.responseRule.pairs[0].response.value);
    } else {
      send.call(this, this.requestData);
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
  fetch = async (...args) => {
    const [resource, initOptions = {}] = args;
    const getOriginalResponse = () => _fetch(...args);

    let request;

    if (resource instanceof Request) {
      request = resource.clone();
    } else {
      request = new Request(resource.toString(), initOptions);
    }

    const url = getAbsoluteUrl(request.url);
    const method = request.method;
    // Request body can be sent only for request methods other than GET and HEAD.
    const canRequestBodyBeSent = !["GET", "HEAD"].includes(method);

    const requestRule = canRequestBodyBeSent && getRequestRule(url);
    if (requestRule) {
      const originalRequestBody = await request.text();
      const requestBody =
        getCustomRequestBody(requestRule, {
          method: request.method,
          url,
          body: originalRequestBody,
          bodyAsJson: jsonifyValidJSONString(originalRequestBody, true),
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
        ruleDetails: requestRule,
        requestDetails: {
          url,
          method: request.method,
          type: "fetch",
          timeStamp: Date.now(),
        },
      });
    }

    let requestData;
    if (canRequestBodyBeSent) {
      requestData = jsonifyValidJSONString(await request.clone().text()); // cloning because the request will be used to make API call
    }

    const responseRule = getResponseRule({ url, requestData, method });
    let responseHeaders;
    let fetchedResponse;

    if (responseRule && shouldServeResponseWithoutRequest(responseRule)) {
      const contentType = isJSON(responseRule.pairs[0].response.value) ? "application/json" : "text/plain";
      responseHeaders = new Headers({ "content-type": contentType });
    } else {
      try {
        if (requestRule) {
          // use modified request to fetch response
          fetchedResponse = await _fetch(request);
        } else {
          fetchedResponse = await getOriginalResponse();
        }

        if (!responseRule) {
          return fetchedResponse;
        }

        responseHeaders = fetchedResponse?.headers;
      } catch (error) {
        if (!responseRule) {
          return Promise.reject(error);
        }
      }
    }

    isDebugMode &&
      console.log("RQ", "Inside the fetch block for url", {
        url,
        resource,
        initOptions,
        fetchedResponse,
      });

    let customResponse;
    const responseModification = responseRule.pairs[0].response;

    if (responseModification.type === "code") {
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
        const fetchedResponseDataAsJson = jsonifyValidJSONString(fetchedResponseData, true);

        evaluatorArgs = {
          ...evaluatorArgs,
          responseType,
          response: fetchedResponseData,
          responseJSON: fetchedResponseDataAsJson,
        };
      }

      customResponse = getFunctionFromCode(responseModification.value)(evaluatorArgs);

      // evaluator might return us Object but response.value is string
      // So make the response consistent by converting to JSON String and then create the Response object
      if (isPromise(customResponse)) {
        customResponse = await customResponse;
      }

      if (typeof customResponse === "object" && isContentTypeJSON(evaluatorArgs?.responseType)) {
        customResponse = JSON.stringify(customResponse);
      }
    } else {
      customResponse = responseModification.value;
    }

    const requestDetails = {
      url,
      method,
      type: "fetch",
      timeStamp: Date.now(),
    };

    notifyResponseRuleApplied({
      rule: responseRule,
      requestDetails,
    });

    // For network failures, fetchedResponse is undefined but we still return customResponse with status=200
    const finalStatusCode = parseInt(responseModification.statusCode || fetchedResponse?.status) || 200;
    const requiresNullResponseBody = [204, 205, 304].includes(finalStatusCode);

    return new Response(requiresNullResponseBody ? null : new Blob([customResponse]), {
      status: finalStatusCode,
      statusText: responseModification.statusText || fetchedResponse?.statusText,
      headers: responseHeaders,
    });
  };
};
