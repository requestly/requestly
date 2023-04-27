import { getAPIResponse } from "actions/ExtensionActions";
import parseCurlAsJson from "./curl-to-json";
import { KeyValuePair, RQAPI, RequestContentType, RequestMethod } from "./types";

export const getEmptyAPIEntry = (): RQAPI.Entry => {
  return {
    request: {
      url: "https://user36644.requestly.dev/test-mock-api",
      queryParams: [],
      method: RequestMethod.GET,
      headers: [],
      body: null,
      contentType: RequestContentType.RAW,
    },
    response: null,
  };
};

export const makeRequest = async (request: RQAPI.Request): Promise<RQAPI.Response> => {
  // TODO: check if Extension or Desktop App is installed and has the support
  // TODO: add support in MV3 extension
  return getAPIResponse(request);
};

export const supportsRequestBody = (method: RequestMethod): boolean => {
  return ![RequestMethod.GET, RequestMethod.HEAD].includes(method);
};

interface CurlParserResponse {
  queries?: Record<string, string>;
  headers?: Record<string, string>;
  method: RequestMethod;
  url: string;
  cookies?: Record<string, string>;
  data?: Record<string, string>;
}

export const parseCurlRequest = (curl: string): RQAPI.Request => {
  try {
    // @ts-ignore
    const json: CurlParserResponse = parseCurlAsJson(curl);
    const queryParams: KeyValuePair[] = Object.entries(json.queries || {}).map(([key, value]) => {
      return {
        key,
        value,
        id: Math.random(),
      };
    });
    const headers: KeyValuePair[] = Object.entries(json.headers || {}).map(([key, value]) => {
      return {
        key,
        value,
        id: Math.random(),
      };
    });

    const contentTypeHeader = headers.find((header) => header.key.toLowerCase() === "content-type");
    const contentTypeHeaderValue = contentTypeHeader?.value as RequestContentType;
    const contentType: RequestContentType =
      contentTypeHeaderValue && Object.values(RequestContentType).includes(contentTypeHeaderValue)
        ? contentTypeHeaderValue
        : RequestContentType.RAW;

    let body: RQAPI.RequestBody;
    if (contentType === RequestContentType.JSON) {
      body = JSON.stringify(json.data);
    } else if (contentType === RequestContentType.FORM) {
      body = Object.entries(json.data || {}).map(([key, value]) => {
        return {
          key,
          value,
          id: Math.random(),
        };
      }) as KeyValuePair[];
    } else {
      body = Object.entries(json.data || {})[0]?.[0] ?? "";
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
