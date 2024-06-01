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
        null,
        true
      );
    }
  );

  RQ.RulesStore.getRules().then((rules) => {
    const doRequestResponseRulesExist = rules.some((rule) => {
      return [RQ.RULE_TYPES.REQUEST, RQ.RULE_TYPES.RESPONSE].includes(rule.ruleType);
    });

    const doRedirectRulesExist = rules.some((rule) => {
      return [RQ.RULE_TYPES.REDIRECT, RQ.RULE_TYPES.REPLACE].includes(rule.ruleType);
    });

    if (doRequestResponseRulesExist || doRedirectRulesExist) {
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

  const clientArgs = {
    namespace: RQ.PUBLIC_NAMESPACE,
    customHeaderPrefix: RQ.CUSTOM_HEADER_PREFIX,
    ignoredHeadersOnRedirect: RQ.IGNORED_HEADERS_ON_REDIRECT,
  };

  RQ.ClientUtils.executeJS(`(${this.interceptAJAXRequests.toString()})(${JSON.stringify(clientArgs)})`);

  RQ.RequestResponseRuleHandler.isInitialized = true;
};

RQ.RequestResponseRuleHandler.cacheRequestRules = async () => {
  const requestRules = await RQ.RulesStore.getEnabledRules(RQ.RULE_TYPES.REQUEST);
  RQ.ClientUtils.executeJS(
    `
    window.${RQ.PUBLIC_NAMESPACE} = window.${RQ.PUBLIC_NAMESPACE} || {};
    window.${RQ.PUBLIC_NAMESPACE}.requestRules = ${JSON.stringify(requestRules)};
  `,
    null,
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
    null,
    true
  );
};

RQ.RequestResponseRuleHandler.cacheRedirectRules = async () => {
  const redirectRules = await RQ.RulesStore.getEnabledRules(RQ.RULE_TYPES.REDIRECT);
  RQ.ClientUtils.executeJS(
    `
    window.${RQ.PUBLIC_NAMESPACE} = window.${RQ.PUBLIC_NAMESPACE} || {};
    window.${RQ.PUBLIC_NAMESPACE}.redirectRules = ${JSON.stringify(redirectRules)};
  `,
    null,
    true
  );
};

RQ.RequestResponseRuleHandler.cacheReplaceRules = async () => {
  const replaceRules = await RQ.RulesStore.getEnabledRules(RQ.RULE_TYPES.REPLACE);
  RQ.ClientUtils.executeJS(
    `
    window.${RQ.PUBLIC_NAMESPACE} = window.${RQ.PUBLIC_NAMESPACE} || {};
    window.${RQ.PUBLIC_NAMESPACE}.replaceRules = ${JSON.stringify(replaceRules)};
  `,
    null,
    true
  );
};

RQ.RequestResponseRuleHandler.updateRulesCache = async () => {
  RQ.RequestResponseRuleHandler.cacheRequestRules();
  RQ.RequestResponseRuleHandler.cacheResponseRules();
  RQ.RequestResponseRuleHandler.cacheRedirectRules();
  RQ.RequestResponseRuleHandler.cacheReplaceRules();
};

/**
 * Do not refer other function/variables from this function.
 * This function will be injected in website and will run in different JS context.
 */

RQ.RequestResponseRuleHandler.interceptAJAXRequests = function ({
  namespace,
  customHeaderPrefix = "",
  ignoredHeadersOnRedirect = [],
}) {
  window[namespace] = window[namespace] || {};
  window[namespace].requestRules = [];
  window[namespace].responseRules = [];
  window[namespace].redirectRules = [];
  window[namespace].replaceRules = [];
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
        const targetedKey = requestPayloadFilter?.key;
        const targetedValue = requestPayloadFilter?.value;

        // tagetedKey is the json path e.g. a.b.0.c
        if (targetedKey && typeof targetedValue !== undefined) {
          const valueInRequestData = traverseJsonByPath(requestData, targetedKey);
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

    return window[namespace].requestRules?.findLast((rule) =>
      window[namespace].matchSourceUrl(rule.pairs[0].source, url)
    );
  };

  const getResponseRule = ({ url, requestData, method }) => {
    if (!isExtensionEnabled()) {
      return null;
    }

    return window[namespace].responseRules?.findLast((rule) => {
      return matchRuleSource({ url, requestData, method }, rule);
    });
  };

  const getMatchingRedirectRule = (url) => {
    if (!isExtensionEnabled()) {
      return null;
    }

    return window[namespace].redirectRules?.findLast((rule) =>
      rule.pairs.some((pair) => window[namespace].matchSourceUrl(pair.source, url))
    );
  };

  const getMatchingReplaceRule = (url) => {
    if (!isExtensionEnabled()) {
      return null;
    }

    return window[namespace].replaceRules?.findLast((rule) =>
      rule.pairs.some((pair) => window[namespace].matchSourceUrl(pair.source, url))
    );
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

  // XHR Implementation
  const updateXhrReadyState = (xhr, readyState) => {
    Object.defineProperty(xhr, "readyState", { writable: true });
    xhr.readyState = readyState;
    xhr.dispatchEvent(new CustomEvent("readystatechange"));
  };

  const resolveXHR = (xhr, responseData) => {
    xhr.dispatchEvent(new ProgressEvent("loadstart"));

    // update response headers
    const contentType = isJSON(responseData) ? "application/json" : "text/plain";
    xhr.getResponseHeader = (key) => {
      if (key.toLowerCase() === "content-type") {
        return contentType;
      }
      return null;
    };
    updateXhrReadyState(xhr, xhr.HEADERS_RECEIVED);
    updateXhrReadyState(xhr, xhr.LOADING);

    // mark resolved
    updateXhrReadyState(xhr, xhr.DONE);
  };

  const OriginalXMLHttpRequest = XMLHttpRequest;

  const createProxyXHRObject = function () {
    const actualXhr = this;

    const dispatchEventToActualXHR = (type, e) => {
      isDebugMode && console.log("[RQ]", `on${type}`, e);
      actualXhr.dispatchEvent(
        new ProgressEvent(type, {
          lengthComputable: e?.lengthComputable,
          loaded: e?.loaded,
          total: e?.total,
        })
      );
    };

    const updateActualXHRReadyState = (readyState) => {
      updateXhrReadyState(actualXhr, readyState);
    };

    const onReadyStateChange = async function () {
      isDebugMode &&
        console.log("[RQ]", "onReadyStateChange", {
          state: this.readyState,
          status: this.status,
          response: this.response,
          xhr: this,
          url: this._requestURL,
        });
      if (!this.responseRule) {
        return;
      }
      const responseModification = this.responseRule.pairs[0].response;

      if (this.readyState === this.HEADERS_RECEIVED) {
        // For network failures, responseStatus=0 but we still return customResponse with status=200
        const responseStatus = parseInt(responseModification.statusCode || this.status) || 200;
        const responseStatusText = responseModification.statusText || this.statusText;

        Object.defineProperties(actualXhr, {
          status: {
            get: () => responseStatus,
          },
          statusText: {
            get: () => responseStatusText,
          },
          getResponseHeader: {
            value: this.getResponseHeader.bind(this),
          },
          getAllResponseHeaders: {
            value: this.getAllResponseHeaders.bind(this),
          },
        });

        updateActualXHRReadyState(this.HEADERS_RECEIVED);
      } else if (this.readyState === this.DONE) {
        const responseType = this.responseType;
        const contentType = this.getResponseHeader("content-type");

        let customResponse =
          responseModification.type === "code"
            ? getFunctionFromCode(responseModification.value)({
                method: this._method,
                url: this._requestURL,
                requestHeaders: this._requestHeaders,
                requestData: jsonifyValidJSONString(this._requestData),
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

        isDebugMode &&
          console.log("[RQ]", "Rule Applied - customResponse", { customResponse, responseType, contentType });

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
        Object.defineProperty(actualXhr, "response", {
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
          Object.defineProperty(actualXhr, "responseText", {
            get: function () {
              return customResponse;
            },
          });
        }

        const responseURL = this.responseURL;
        const responseXML = this.responseXML;

        Object.defineProperties(actualXhr, {
          responseType: {
            get: function () {
              return responseType;
            },
          },
          responseURL: {
            get: function () {
              return responseURL;
            },
          },
          responseXML: {
            get: function () {
              return responseXML;
            },
          },
        });

        const requestDetails = {
          url: this._requestURL,
          method: this._method,
          type: "xmlhttprequest",
          timeStamp: Date.now(),
        };

        // mark resolved)
        if (this._abort) {
          // Note: This might get delayed due to async in code block
          dispatchEventToActualXHR("abort");
          dispatchEventToActualXHR("loadend");
        } else {
          updateActualXHRReadyState(this.DONE);
          dispatchEventToActualXHR("load");
          dispatchEventToActualXHR("loadend");
        }

        notifyResponseRuleApplied({
          rule: this.responseRule,
          requestDetails,
        });
      } else {
        updateActualXHRReadyState(this.readyState);
      }
    };

    const xhr = new OriginalXMLHttpRequest();
    xhr.addEventListener("readystatechange", onReadyStateChange.bind(xhr), false);
    xhr.addEventListener("abort", dispatchEventToActualXHR.bind(xhr, "abort"), false);
    xhr.addEventListener("error", dispatchEventToActualXHR.bind(xhr, "error"), false);
    xhr.addEventListener("timeout", dispatchEventToActualXHR.bind(xhr, "timeout"), false);
    xhr.addEventListener("loadstart", dispatchEventToActualXHR.bind(xhr, "loadstart"), false);
    xhr.addEventListener("progress", dispatchEventToActualXHR.bind(xhr, "progress"), false);

    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), "timeout");

    // FIXME: This is breaking for some websites.
    // https://linear.app/requestly/issue/ENGG-1823
    if (descriptor) {
      Object.defineProperty(actualXhr, "timeout", {
        get: function () {
          return descriptor.get.call(this);
        },
        set: function (value) {
          xhr.timeout = value;
          descriptor.set.call(this, value);
        },
      });
    }

    this.rqProxyXhr = xhr;
  };

  XMLHttpRequest = function () {
    const xhr = new OriginalXMLHttpRequest();
    createProxyXHRObject.call(xhr);
    return xhr;
  };

  XMLHttpRequest.prototype = OriginalXMLHttpRequest.prototype;
  Object.entries(OriginalXMLHttpRequest).map(([key, val]) => {
    XMLHttpRequest[key] = val;
  });

  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.rqProxyXhr._method = method;
    this.rqProxyXhr._requestURL = getAbsoluteUrl(url);
    open.apply(this.rqProxyXhr, arguments);
    open.apply(this, arguments);
  };

  const abort = XMLHttpRequest.prototype.abort;
  XMLHttpRequest.prototype.abort = function () {
    isDebugMode && console.log("abort called");
    this.rqProxyXhr._abort = true;
    abort.apply(this, arguments);
    abort.apply(this.rqProxyXhr, arguments);
  };

  let setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    this.rqProxyXhr._requestHeaders = this.rqProxyXhr._requestHeaders || {};
    this.rqProxyXhr._requestHeaders[header] = value;
    setRequestHeader.apply(this.rqProxyXhr, arguments);
    setRequestHeader.apply(this, arguments);
  };

  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (data) {
    this.rqProxyXhr._requestData = data;

    const requestRule = getRequestRule(this.rqProxyXhr._requestURL);
    if (requestRule) {
      this.rqProxyXhr._requestData = getCustomRequestBody(requestRule, {
        method: this.rqProxyXhr._method,
        url: this.rqProxyXhr._requestURL,
        body: data,
        bodyAsJson: jsonifyValidJSONString(data, true),
      });

      notifyRequestRuleApplied({
        ruleDetails: requestRule,
        requestDetails: {
          url: this.rqProxyXhr._requestURL,
          method: this.rqProxyXhr._method,
          type: "xmlhttprequest",
          timeStamp: Date.now(),
        },
      });
    }

    this.responseRule = getResponseRule({
      url: this.rqProxyXhr._requestURL,
      requestData: jsonifyValidJSONString(this.rqProxyXhr._requestData),
      method: this.rqProxyXhr._method,
    });
    this.rqProxyXhr.responseRule = this.responseRule;

    const redirectRuleThatMatchesURL = getMatchingRedirectRule(this.rqProxyXhr._requestURL);
    const replaceRuleThatMatchesURL = getMatchingReplaceRule(this.rqProxyXhr._requestURL);
    if (redirectRuleThatMatchesURL || replaceRuleThatMatchesURL) {
      ignoredHeadersOnRedirect.forEach((header) => {
        // Stores ignored header to be set on redirected URL. Refer: https://github.com/requestly/requestly/issues/1208
        const originalHeaderValue =
          this.rqProxyXhr._requestHeaders?.[header] || this.rqProxyXhr._requestHeaders?.[header.toLowerCase()];
        if (isExtensionEnabled() && originalHeaderValue) {
          this.setRequestHeader(customHeaderPrefix + header, originalHeaderValue);
        }
      });
    }

    if (this.responseRule) {
      isDebugMode && console.log("[RQ]", "send and response rule matched", this.responseRule);
      if (shouldServeResponseWithoutRequest(this.responseRule)) {
        isDebugMode && console.log("[RQ]", "send and response rule matched and serveWithoutRequest is true");
        resolveXHR(this.rqProxyXhr, this.responseRule.pairs[0].response.value);
      } else {
        send.call(this.rqProxyXhr, this.rqProxyXhr._requestData);
      }
      return;
    }

    send.call(this, this.rqProxyXhr._requestData);
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

    let hasModifiedHeaders = false;

    const url = getAbsoluteUrl(request.url);
    const method = request.method;

    const redirectRuleThatMatchesURL = getMatchingRedirectRule(url);
    const replaceRuleThatMatchesURL = getMatchingReplaceRule(url);

    // redirect/replace rule specific code that is applied only when redirect/replace rule matches the URL
    if (redirectRuleThatMatchesURL || replaceRuleThatMatchesURL) {
      // Stores Auth header to be set on redirected URL. Refer: https://github.com/requestly/requestly/issues/1208
      ignoredHeadersOnRedirect.forEach((header) => {
        const originalHeaderValue = request.headers.get(header);
        if (isExtensionEnabled() && originalHeaderValue) {
          hasModifiedHeaders = true;
          request.headers.set(customHeaderPrefix + header, originalHeaderValue);
        }
      });
    }

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
        if (requestRule || hasModifiedHeaders) {
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
