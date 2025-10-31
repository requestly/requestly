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

export enum RequestContentType {
  RAW = "text/plain",
  JSON = "application/json",
  FORM = "application/x-www-form-urlencoded",
  MULTIPART_FORM = "multipart/form-data",
  HTML = "text/html",
  XML = "application/xml",
  JAVASCRIPT = "application/javascript",
}

interface KeyValuePair {
  id?: number;
  key: string;
  value: string;
}

type RequestBody = string | KeyValuePair[]; // in case of form data, body will be key-value pairs

export type MultipartFileValue = {
  id: string; // file id for each multipart key value pair
  name: string;
  path: string;
  size: number;
  source: "extension" | "desktop";
};

export type FormDataKeyValuePair = KeyValuePair & {
  value: string | MultipartFileValue[];
};

export type RequestBodyContainer = {
  text?: string;
  form?: KeyValuePair[];
  multipartForm?: FormDataKeyValuePair[];
};

//fix the interface - provide support for bodycontainer here
interface Request {
  url: string;
  queryParams: KeyValuePair[];
  method: RequestMethod;
  headers: KeyValuePair[];
  // body?: RequestBody;
  bodycontainer: RequestBodyContainer;
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

//FIX THIS
const isFormRequest = (method: RequestMethod, contentType: RequestContentType, body: any): body is KeyValuePair[] => {
  return ![RequestMethod.GET, RequestMethod.HEAD].includes(method) && contentType === RequestContentType.FORM;
};

export const getBodyFromBodyContainer = (
  bodyContainer: RequestBodyContainer,
  contentType: RequestContentType
): RequestBody => {
  if (!bodyContainer) return null;

  switch (contentType) {
    case RequestContentType.JSON:
    case RequestContentType.RAW:
      return bodyContainer.text ?? "";

    case RequestContentType.FORM:
      return bodyContainer.form ?? [];

    case RequestContentType.MULTIPART_FORM:
      return bodyContainer.multipartForm ?? [];

    default:
      return bodyContainer.text ?? "";
  }
};

/* CORE */
//FIX THIS PART: we are now relying on the bodycontainer
//One thing not decided yet, should the extraction of body from bodycontainer based on content type should happen here or one level before in app
//code
export async function getAPIResponse(apiRequest: Request): Promise<Response | { error: string }> {
  const method = apiRequest.method || "GET";
  const headers = new Headers();
  const body = getBodyFromBodyContainer(apiRequest.bodycontainer, apiRequest.contentType);
  console.log("Body", body);
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
