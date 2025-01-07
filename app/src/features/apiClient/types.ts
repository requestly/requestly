import { EnvironmentVariables } from "backend/environment/types";
import { AUTH_OPTIONS } from "./screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/form";
import { AUTHORIZATION_TYPES } from "./screens/apiClient/components/clientView/components/request/components/AuthorizationView/types";

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
  isEnabled: boolean;
  type?: string; // added for special identifiers like auth
}

export enum KeyValueFormType {
  HEADERS = "headers",
  QUERY_PARAMS = "queryParams",
  FORM = "form",
}

export enum QueryParamSyncType {
  SYNC = "sync",
  URL = "url",
  TABLE = "table",
}

export type CollectionVariableMap = Record<string, { variables: EnvironmentVariables }>;

export namespace RQAPI {
  export type AnalyticsEventSource =
    | "collection_row"
    | "collection_list_empty_state"
    | "api_client_sidebar_header"
    | "api_client_sidebar";

  export enum RecordType {
    API = "api",
    COLLECTION = "collection",
    ENVIRONMENT = "environment",
  }

  export enum ScriptType {
    PRE_REQUEST = "preRequest",
    POST_RESPONSE = "postResponse",
  }

  export type RequestBody = string | KeyValuePair[]; // in case of form data, body will be key-value pairs

  export type AuthOptions<T extends AUTHORIZATION_TYPES = AUTHORIZATION_TYPES> = {
    currentAuthType: T;
  } & {
    [K in AUTHORIZATION_TYPES]?: K extends T ? AUTH_OPTIONS : never;
  };
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
    scripts?: {
      preRequest: string;
      postResponse: string;
    };
    auth?: AuthOptions;
  }

  export interface RequestErrorEntry {
    request: RQAPI.Request;
    response: null;
    error: {
      source: string;
      message: Error["message"];
      name: Error["name"];
    };
  }

  export interface Collection {
    children?: Record[];
    scripts?: {
      preRequest: string;
      postResponse: string;
    };
    variables: Omit<EnvironmentVariables, "localValue">;
    auth?: AuthOptions;
  }

  interface RecordMetadata {
    id: string;
    name: string;
    description?: string;
    collectionId: CollectionRecord["id"] | null;
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
