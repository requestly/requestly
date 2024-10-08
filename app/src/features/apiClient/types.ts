export enum RequestMethod {
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
}

export interface KeyValuePair {
  id: number;
  key: string;
  value: string;
}

export namespace RQAPI {
  export enum RecordType {
    API = "api",
    COLLECTION = "collection",
  }

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
    response?: Response;
  }

  export interface Collection {
    children?: Record; // For now it will be a ApiRecord
  }

  interface RecordMetadata {
    id: string;
    name: string;
    description?: string;
    collectionId: string | null;
    ownerId: string;
    deleted: boolean;
    createdBy: string;
    updatedBy: string;
    createdTs: number;
    updatedTs: number;
  }

  export interface ApiRecord extends RecordMetadata {
    type: RecordType.API;
    data: Entry;
  }

  export interface CollectionRecord extends RecordMetadata {
    type: RecordType.COLLECTION;
    data: Collection;
  }

  export type Record = ApiRecord | CollectionRecord;
}
