import {
  applyDelay,
  getAbsoluteUrl,
  getCustomRequestBody,
  getFunctionFromCode,
  getMatchedDelayRule,
  getMatchedRequestRule,
  getMatchedResponseRule,
  isContentTypeJSON,
  isJSON,
  isPromise,
  jsonifyValidJSONString,
  notifyOnBeforeRequest,
  notifyRequestRuleApplied,
  notifyResponseRuleApplied,
  shouldServeResponseWithoutRequest,
} from "./utils";

export const initFetchInterceptor = (debug) => {
  const _fetch = fetch;
  fetch = async (...args) => {
    const [resource, initOptions = {}] = args;
    const getOriginalResponse = () => _fetch(...args);
    try {
      let request;

      if (resource instanceof Request) {
        request = resource.clone();
      } else {
        request = new Request(resource.toString(), initOptions);
      }

      const url = getAbsoluteUrl(request.url);
      const method = request.method;

      const matchedDelayRulePair = getMatchedDelayRule({
        url: url,
        method: method,
        type: "fetch",
        initiator: location.origin, // initiator=origin. Should now contain port and protocol
      });

      if (matchedDelayRulePair) {
        await applyDelay(matchedDelayRulePair.delay);
      }

      // Request body can be sent only for request methods other than GET and HEAD.
      const canRequestBodyBeSent = !["GET", "HEAD"].includes(method);
      let requestData;
      if (canRequestBodyBeSent) {
        requestData = jsonifyValidJSONString(await request.clone().text()); // cloning because the request will be used to make API call
      }

      const requestRule =
        canRequestBodyBeSent &&
        getMatchedRequestRule({
          url: url,
          method: method,
          type: "fetch",
          initiator: location.origin, // initiator=origin. Should now contain port and protocol
          requestData,
        });

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
            url: url,
            method: request.method,
            type: "fetch",
            timeStamp: Date.now(),
          },
        });
      }

      const responseRule = getMatchedResponseRule({
        url,
        requestData,
        method,
      });

      let responseHeaders;
      let fetchedResponse;

      if (responseRule && shouldServeResponseWithoutRequest(responseRule)) {
        const contentType = isJSON(responseRule.pairs[0].response.value) ? "application/json" : "text/plain";
        responseHeaders = new Headers({ "content-type": contentType });
      } else {
        try {
          const headersObject = {};
          request?.headers?.forEach((value, key) => {
            headersObject[key] = value;
          });
          await notifyOnBeforeRequest({
            url,
            method,
            type: "xmlhttprequest",
            initiator: location.origin,
            requestHeaders: headersObject,
          });

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

      debug &&
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

        const responseClone = fetchedResponse.clone();

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

        customResponse = getFunctionFromCode(responseModification.value, "response")(evaluatorArgs);

        if (typeof customResponse === "undefined") {
          return responseClone;
        }

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
        ruleDetails: responseRule,
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
    } catch (err) {
      debug && console.log("[RQ.fetch] Error in fetch", err);
      return await getOriginalResponse();
    }
  };
};
