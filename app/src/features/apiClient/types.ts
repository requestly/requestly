import { EnvironmentVariables } from "backend/environment/types";
import { AUTH_OPTIONS } from "./screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/form";
import { AUTHORIZATION_TYPES } from "./screens/apiClient/components/clientView/components/request/components/AuthorizationView/types";
import { TestResult } from "./helpers/modules/scriptsV2/worker/script-internals/types";

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

export enum ImporterTypes {
  BRUNO = "BRUNO",
  POSTMAN = "POSTMAN",
  REQUESTLY = "REQUESTLY",
  CURL = "CURL",
}

export type CollectionVariableMap = Record<string, { variables: EnvironmentVariables }>;

export namespace RQAPI {
  export type AnalyticsEventSource =
    | "home-screen"
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

  export type RequestBody = RequestJsonBody | RequestRawBody | RequestFormBody; // in case of form data, body will be key-value pairs
  export type RequestJsonBody = string;
  export type RequestRawBody = string;
  export type RequestFormBody = KeyValuePair[];

  export type RequestBodyContainer = {
    text?: string;
    form?: KeyValuePair[];
  };

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
    bodyContainer?: RequestBodyContainer;
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
    testResults?: TestResult[];
    scripts?: {
      preRequest: string;
      postResponse: string;
    };
    auth?: AuthOptions;
  }

  export enum ExecutionStatus {
    SUCCESS = "success",
    ERROR = "error",
  }

  export type ExecutionError = {
    source: string;
    name: Error["name"];
    message: Error["message"];
  };

  export type ExecutionResult =
    | {
        status: ExecutionStatus.SUCCESS;
        executedEntry: RQAPI.Entry;
      }
    | {
        status: ExecutionStatus.ERROR;
        executedEntry: RQAPI.Entry;
        error: ExecutionError;
      };

  export type RerunResult =
    | {
        status: ExecutionStatus.SUCCESS;
        artifacts: {
          testResults: TestResult[];
        };
      }
    | {
        status: ExecutionStatus.ERROR;
        error: ExecutionError;
      };

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
