import { apiRequestCorrelationManager } from "./ApiRequestCorrelationManager";

/* TYPES */
enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

enum RequestContentType {
  RAW = "text/plain",
  JSON = "application/json",
  FORM = "application/x-www-form-urlencoded",
}

interface KeyValuePair {
  id?: number;
  key: string;
  value: string;
}

type RequestBody = string | KeyValuePair[]; // in case of form data, body will be key-value pairs

interface Request {
  url: string;
  queryParams: KeyValuePair[];
  method: RequestMethod;
  headers: KeyValuePair[];
  body?: RequestBody;
  contentType?: RequestContentType;
  includeCredentials?: boolean;
}

interface Response {
  body: string;
  headers: KeyValuePair[];
  status: number;
  statusText: string;
  time: number;
  redirectedUrl: string;
}

export const REQUESTLY_ID_HEADER = "x-requestly-id";

/* UTIL */

const isFormRequest = (
  method: RequestMethod,
  contentType: RequestContentType,
  body: Request["body"]
): body is KeyValuePair[] => {
  return ![RequestMethod.GET, RequestMethod.HEAD].includes(method) && contentType === RequestContentType.FORM;
};

/* CORE */
export async function getAPIResponse(apiRequest: Request): Promise<Response | { error: string }> {
  const method = apiRequest.method || "GET";
  const headers = new Headers();
  const body = apiRequest.body;
  let url = apiRequest.url;
  let finalRequestBody: any = body;

  if (apiRequest?.queryParams.length) {
    const urlObj = new URL(apiRequest.url);
    const searchParams = new URLSearchParams(urlObj.search);
    apiRequest.queryParams.forEach(({ key, value }) => {
      searchParams.append(key, value);
    });
    urlObj.search = searchParams.toString();
    url = urlObj.toString();
  }

  apiRequest?.headers.forEach(({ key, value }) => {
    headers.append(key, value);
  });

  const requestlyId = crypto.randomUUID();
  headers.append(REQUESTLY_ID_HEADER, requestlyId);

  if (isFormRequest(apiRequest.method, apiRequest.contentType, body)) {
    const formData = new FormData();
    body?.forEach(({ key, value }) => {
      formData.append(key, value);
    });

    const urlSearchParams = new URLSearchParams();
    for (const [param, value] of formData.entries()) {
      urlSearchParams.append(param, value as string);
    }
    finalRequestBody = urlSearchParams;
  }

  try {
    const requestStartTime = performance.now();

    let responseHeaders: KeyValuePair[] = [];
    apiRequestCorrelationManager.addHandler(
      requestlyId,
      (requestDetails: chrome.webRequest.WebResponseHeadersDetails) => {
        responseHeaders = requestDetails.responseHeaders?.map((header) => ({
          key: header.name,
          value: header.value,
        }));
      }
    );

    const response = await fetch(url, {
      method,
      headers,
      body: finalRequestBody,
      credentials: apiRequest.includeCredentials ? "include" : "omit",
    });
    const responseTime = performance.now() - requestStartTime;

    const fetchedResponseHeaders = [];
    for (const [key, value] of response.headers.entries()) {
      fetchedResponseHeaders.push({ key, value });
    }
    responseHeaders = responseHeaders.length ? responseHeaders : fetchedResponseHeaders;

    const responseBlob = await response.blob();
    const contentType = responseHeaders.find((header) => header.key.toLowerCase() === "content-type")?.value;

    let responseBody: string;
    if (contentType?.includes("image/")) {
      const getImageDataUri = (blob: Blob) => {
        return new Promise<typeof responseBody>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target.result as string);
          reader.onerror = () => reject(null);
          reader.readAsDataURL(blob);
        });
      };
      responseBody = await getImageDataUri(responseBlob);
    } else {
      responseBody = await responseBlob.text();
    }
    return {
      body: responseBody,
      time: responseTime,
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText,
      redirectedUrl: response.url !== url ? response.url : "",
    };
  } catch (e) {
    return {
      error: e.message,
    };
  } finally {
    apiRequestCorrelationManager.removeHandler(requestlyId);
  }
}
