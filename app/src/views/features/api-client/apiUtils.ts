import { getAPIResponse as getAPIResponseViaExtension } from "actions/ExtensionActions";
import { getAPIResponse as getAPIResponseViaProxy } from "actions/DesktopActions";
import parseCurlAsJson from "./curl-to-json";
import { CurlParserResponse, KeyValuePair, RQAPI, RequestContentType, RequestMethod } from "./types";
// @ts-ignore
import { CONSTANTS } from "@requestly/requestly-core";

export const makeRequest = async (
  appMode: string,
  request: RQAPI.Request,
  signal?: AbortSignal
): Promise<RQAPI.Response> => {
  // TODO: check if Extension or Desktop App is installed and has the support
  // TODO: add support in MV3 extension
  return new Promise((resolve, reject) => {
    if (signal) {
      if (signal.aborted) {
        reject();
      }

      const abortListener = () => {
        signal.removeEventListener("abort", abortListener);
        reject();
      };
      signal.addEventListener("abort", abortListener);
    }

    if (appMode === CONSTANTS.APP_MODES.EXTENSION) {
      getAPIResponseViaExtension(request).then(resolve);
    } else if (appMode === CONSTANTS.APP_MODES.DESKTOP) {
      getAPIResponseViaProxy(request).then(resolve);
    } else {
      resolve(null);
    }
  });
};

export const addUrlSchemeIfMissing = (url: string): string => {
  if (url && !/^([a-z][a-z0-9+\-.]*):\/\//.test(url)) {
    return "https://" + url;
  }

  return url;
};

export const getEmptyAPIEntry = (): RQAPI.Entry => {
  return {
    request: {
      url: "https://app.requestly.io/echo",
      queryParams: [],
      method: RequestMethod.GET,
      headers: [],
      body: null,
      contentType: RequestContentType.RAW,
    },
    response: null,
  };
};

export const removeEmptyKeys = (keyValuePairs: KeyValuePair[]): KeyValuePair[] => {
  return keyValuePairs.filter((pair) => pair.key.length);
};

export const supportsRequestBody = (method: RequestMethod): boolean => {
  return ![RequestMethod.GET, RequestMethod.HEAD].includes(method);
};

export const generateKeyValuePairsFromJson = (json: Record<string, string> = {}): KeyValuePair[] => {
  return Object.entries(json || {}).map(([key, value]) => {
    return {
      key,
      value,
      id: Math.random(),
    };
  });
};

export const getContentTypeFromRequestHeaders = (headers: KeyValuePair[]): RequestContentType => {
  const contentTypeHeader = headers.find((header) => header.key.toLowerCase() === "content-type");
  const contentTypeHeaderValue = contentTypeHeader?.value as RequestContentType;
  const contentType: RequestContentType = Object.values(RequestContentType).find((type) =>
    contentTypeHeaderValue.includes(type)
  );

  return contentType || RequestContentType.RAW;
};

export const getContentTypeFromResponseHeaders = (headers: KeyValuePair[]): string => {
  return headers.find((header) => header.key.toLowerCase() === "content-type")?.value;
};

export const parseCurlRequest = (curl: string): RQAPI.Request => {
  try {
    // @ts-ignore
    const json: CurlParserResponse = parseCurlAsJson(curl);
    const queryParams = generateKeyValuePairsFromJson(json.queries);
    const headers = generateKeyValuePairsFromJson(json.headers);
    const contentType = getContentTypeFromRequestHeaders(headers);

    let body: RQAPI.RequestBody;
    if (contentType === RequestContentType.JSON) {
      body = JSON.stringify(json.data);
    } else if (contentType === RequestContentType.FORM) {
      body = generateKeyValuePairsFromJson(json.data);
    } else {
      body = Object.entries(json.data || {})[0]?.[0] ?? ""; // when body is string, json.data = { "string": "" }
    }

    const request: RQAPI.Request = {
      url: json.url,
      method: json.method,
      queryParams,
      headers,
      contentType,
      body,
    };
    return request;
  } catch (e) {
    return null;
  }
};
