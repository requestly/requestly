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

export namespace RQAPI {
  export interface QueryParam {
    id?: number;
    key: string;
    value: string;
  }

  export interface Header {
    id?: number;
    name: string;
    value: string;
  }

  export interface Request {
    url: string;
    queryParams: QueryParam[];
    method: RequestMethod;
    headers: Header[];
    body?: string;
  }

  export interface Response {
    body: string;
    headers: Header[];
    status: number;
    statusText: string;
    time: number;
  }

  export interface Entry {
    request: Request;
    response: Response;
  }
}
