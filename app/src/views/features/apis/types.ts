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
  RAW = "raw",
  JSON = "json",
  FORM = "form",
}

export interface KeyValuePair {
  id?: number;
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
  }

  export interface Entry {
    request: Request;
    response: Response;
  }
}
