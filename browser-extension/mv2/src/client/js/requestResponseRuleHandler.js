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
      return [RQ.RULE_TYPES.REQUEST, RQ.RULE_TYPES.RESPONSE].includes(
        rule.ruleType
      );
    });

    if (doRequestResponseRulesExist) {
      RQ.RequestResponseRuleHandler.init();
    }
  });

  RQ.RulesStore.onRuleOrGroupChange(() => {
    if (!RQ.RequestResponseRuleHandler.isInitialized) {
      RQ.RequestResponseRuleHandler.init();
    }
    RQ.RequestResponseRuleHandler.updateCacheOnRuleChanges();
  });
};

RQ.RequestResponseRuleHandler.init = function () {
  // we match request rules on client-side whereas response rules are still matched in background
  RQ.ClientUtils.executeJS(
    `(${RQ.ClientRuleMatcher.toString()})('${RQ.PUBLIC_NAMESPACE}')`
  );

  RQ.RequestResponseRuleHandler.cacheRequestRules();

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === RQ.CLIENT_MESSAGES.OVERRIDE_RESPONSE) {
      RQ.RequestResponseRuleHandler.cacheResponseRule(
        message.url,
        message.rule
      );
    }
  });

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

  RQ.ClientUtils.executeJS(
    `(${this.interceptAJAXRequests.toString()})('${RQ.PUBLIC_NAMESPACE}')`
  );

  RQ.RequestResponseRuleHandler.isInitialized = true;
};

RQ.RequestResponseRuleHandler.cacheRequestRules = () => {
  RQ.RulesStore.getEnabledRules(RQ.RULE_TYPES.REQUEST).then((requestRules) => {
    RQ.ClientUtils.executeJS(
      `
      window.${RQ.PUBLIC_NAMESPACE} = window.${RQ.PUBLIC_NAMESPACE} || {};
      window.${RQ.PUBLIC_NAMESPACE}.requestRules = ${JSON.stringify(
        requestRules
      )};
    `,
      true
    );
  });
};

RQ.RequestResponseRuleHandler.cacheResponseRule = (url, responseRule) => {
  RQ.ClientUtils.executeJS(
    `window.${
      RQ.PUBLIC_NAMESPACE
    }.responseRulesByUrl['${url}'] = ${JSON.stringify(responseRule)};`,
    true
  );
  RQ.RequestResponseRuleHandler.cachedResponseRuleIds.add(responseRule.id);
};

RQ.RequestResponseRuleHandler.removeResponseRuleFromCache = (ruleId) => {
  RQ.ClientUtils.executeJS(
    `Object.entries(window.${RQ.PUBLIC_NAMESPACE}.responseRulesByUrl).forEach(([url, rule]) => {
      if (rule.id === '${ruleId}') {
        delete window.${RQ.PUBLIC_NAMESPACE}.responseRulesByUrl[url];
      }
    });`,
    true
  );
  RQ.RequestResponseRuleHandler.cachedResponseRuleIds.delete(ruleId);
};

RQ.RequestResponseRuleHandler.updateCacheOnRuleChanges = () => {
  RQ.RequestResponseRuleHandler.cacheRequestRules();

  RQ.RulesStore.getEnabledRules(RQ.RULE_TYPES.RESPONSE).then(
    (responseRules) => {
      const enabledResponseRuleIds = responseRules.map((rule) => rule.id);
      RQ.RequestResponseRuleHandler.cachedResponseRuleIds.forEach((ruleId) => {
        if (!enabledResponseRuleIds.includes(ruleId)) {
          RQ.RequestResponseRuleHandler.removeResponseRuleFromCache(ruleId);
        }
      });
    }
  );
};

/**
 * @param {*} namespace __REQUESTLY__
 * Do not refer other function/variables from this function.
 * This function will be injected in website and will run in different JS context.
 */

RQ.RequestResponseRuleHandler.interceptAJAXRequests = function (namespace) {
  window[namespace] = window[namespace] || {};
  window[namespace].requestRules = [];
  window[namespace].responseRulesByUrl = {};
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

  const isResponseRuleApplicableOnUrl = (url) => {
    return window[namespace].responseRulesByUrl.hasOwnProperty(
      getAbsoluteUrl(url)
    );
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

  const isRequestPayloadFilterApplicable = (
    { requestData, method },
    sourceFilters
  ) => {
    const sourceFiltersArray = Array.isArray(sourceFilters)
      ? sourceFilters
      : [sourceFilters];

    return (
      !sourceFiltersArray.length ||
      sourceFiltersArray.some((sourceFilter) => {
        if (
          sourceFilter?.requestMethod?.length &&
          !sourceFilter.requestMethod.includes(method)
        ) {
          return false;
        }

        let requestPayloadFilter = sourceFilter?.requestPayload;

        if (!requestPayloadFilter) return true;
        if (
          typeof requestPayloadFilter === "object" &&
          Object.keys(requestPayloadFilter).length === 0
        )
          return true;

        // We only allow request payload targeting when requestData is JSON
        if (!requestData || typeof requestData !== "object") return false;
        if (Object.keys(requestData).length === 0) return false;

        requestPayloadFilter = requestPayloadFilter || {};
        const targettedKey = requestPayloadFilter?.key;

        // tagettedKey is the json path e.g. a.b.0.c
        if (targettedKey) {
          const valueInRequestData = traverseJsonByPath(
            requestData,
            targettedKey
          );
          return valueInRequestData == requestPayloadFilter?.value;
        }

        return false;
      })
    );
  };

  const getRequestRule = (url) => {
    if (!isExtensionEnabled()) {
      return null;
    }

    const absoluteUrl = getAbsoluteUrl(url);

    return window[namespace].requestRules.findLast((rule) =>
      window[namespace].matchSourceUrl(rule.pairs[0].source, absoluteUrl)
    );
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

  const getResponseRule = (url) => {
    if (!isExtensionEnabled()) {
      return null;
    }
    return window[namespace].responseRulesByUrl[getAbsoluteUrl(url)];
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
    const paramsObject = Object.fromEntries(
      new URLSearchParams(searchParamsString)
    );

    // Traverse paramsObject to convert JSON strings into JSON object
    for (paramName in paramsObject) {
      const paramValue = paramsObject[paramName];
      paramsObject[paramName] = jsonifyValidJSONString(paramValue);
    }

    return paramsObject;
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
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function";

  const isContentTypeJSON = (contentType) =>
    !!contentType?.includes("application/json");

  // Intercept XMLHttpRequest
  const onReadyStateChange = async function () {
    if (
      this.readyState === this.HEADERS_RECEIVED ||
      this.readyState === this.DONE
    ) {
      let url;

      if (isResponseRuleApplicableOnUrl(this.responseURL)) {
        url = this.responseURL;
      } else if (isResponseRuleApplicableOnUrl(this.requestURL)) {
        url = this.requestURL;
      } else {
        return;
      }

      const responseRule = getResponseRule(url);
      const { response: responseModification, source } = responseRule.pairs[0];
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
        const responseStatus =
          responseModification.statusCode || this.status || 200;
        const responseStatusText =
          responseModification.statusText || this.statusText;

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
                url,
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

        const isUnsupportedResponseType =
          responseType && !["json", "text"].includes(responseType);

        // We do not support statically modifying responses of type - blob, arraybuffer, document etc.
        if (
          responseModification.type === "static" &&
          isUnsupportedResponseType
        ) {
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
            if (
              responseModification.type === "static" &&
              responseType === "json"
            ) {
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

        notifyResponseRuleApplied({
          rule: responseRule,
          requestDetails,
        });
      }
    }
  };

  const XHR = XMLHttpRequest;
  XMLHttpRequest = function () {
    const xhr = new XHR();
    xhr.addEventListener(
      "readystatechange",
      onReadyStateChange.bind(xhr),
      false
    );
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
    const requestRule = getRequestRule(this.requestURL);
    let requestBody;

    if (requestRule) {
      requestBody = getCustomRequestBody(requestRule, {
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
    } else {
      requestBody = data;
    }

    this.requestData = requestBody;
    send.call(this, requestBody);
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

    let fetchedResponse;
    let exceptionCaught;

    const method = request.method;
    // Request body can be sent only for request methods other than GET and HEAD.
    const canRequestBodyBeSent = !["GET", "HEAD"].includes(method);

    const requestRule = canRequestBodyBeSent && getRequestRule(request.url);
    if (requestRule) {
      const originalRequestBody = await request.text();
      const requestBody =
        getCustomRequestBody(requestRule, {
          method: request.method,
          url: request.url,
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
          url: request.url,
          method: request.method,
          type: "fetch",
          timeStamp: Date.now(),
        },
      });
    }

    try {
      if (requestRule) {
        // request has already been read while processing requestRule, so needs to be cloned
        fetchedResponse = await _fetch(request.clone());
      } else {
        fetchedResponse = await getOriginalResponse();
      }
    } catch (error) {
      exceptionCaught = error;
    }

    let url;

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

    const responseRule = getResponseRule(url);
    const { response: responseModification, source } = responseRule.pairs[0];

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

    let requestData;

    if (canRequestBodyBeSent) {
      requestData = jsonifyValidJSONString(await request.text());
    } else {
      requestData = convertSearchParamsToJSON(url);
    }

    if (
      !isRequestPayloadFilterApplicable(
        { requestData, method },
        source?.filters
      )
    ) {
      return fetchedResponse;
    }

    let customResponse;

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
        const fetchedResponseDataAsJson = jsonifyValidJSONString(
          fetchedResponseData,
          true
        );

        evaluatorArgs = {
          ...evaluatorArgs,
          responseType,
          response: fetchedResponseData,
          responseJSON: fetchedResponseDataAsJson,
        };
      }

      customResponse = getFunctionFromCode(responseModification.value)(
        evaluatorArgs
      );

      // evaluator might return us Object but response.value is string
      // So make the response consistent by converting to JSON String and then create the Response object
      if (isPromise(customResponse)) {
        customResponse = await customResponse;
      }

      if (
        typeof customResponse === "object" &&
        isContentTypeJSON(evaluatorArgs?.responseType)
      ) {
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

    return new Response(new Blob([customResponse]), {
      // For network failures, fetchedResponse is undefined but we still return customResponse with status=200
      status: responseModification.statusCode || fetchedResponse?.status || 200,
      statusText:
        responseModification.statusText || fetchedResponse?.statusText,
      headers: fetchedResponse?.headers,
    });
  };
};
