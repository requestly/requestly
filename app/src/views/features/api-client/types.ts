export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  CONNECT = "CONNECT",
  OPTIONS = "OPTIONS",
  TRACE = "TRACE",
}

export enum RequestContentType {
  RAW = "text/plain",
  JSON = "application/json",
  FORM = "application/x-www-form-urlencoded",
}

export interface KeyValuePair {
  id: number;
  key: string;
  value: string;
}

export namespace RQAPI {
  export type RequestBody = string | KeyValuePair[]; // in case of form data, body will be key-value pairs

  export interface Request {
    url: string;
    queryParams: KeyValuePair[];
    method: RequestMethod;
    headers: KeyValuePair[];
    body?: RequestBody;
    contentType?: RequestContentType;
  }

  export interface Response {
    body: string;
    headers: KeyValuePair[];
    status: number;
    statusText: string;
    time: number;
    redirectedUrl: string;
  }

  export interface Entry {
    request: Request;
    response: Response;
  }
}

export interface CurlParserResponse {
  queries?: Record<string, string>;
  headers?: Record<string, string>;
  method: RequestMethod;
  url: string;
  cookies?: Record<string, string>;
  data?: Record<string, string>;
}
