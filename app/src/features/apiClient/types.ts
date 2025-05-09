import { EnvironmentVariables } from "backend/environment/types";
import { TestResult } from "./helpers/modules/scriptsV2/worker/script-internals/types";
import {
  ApiKeyAuthorizationConfig,
  Authorization,
  BasicAuthAuthorizationConfig,
  BearerTokenAuthorizationConfig,
} from "./screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/AuthConfig";
import { ErroredRecord } from "./helpers/modules/sync/local/services/types";

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

export enum CreateType {
  API = "api",
  COLLECTION = "collection",
  ENVIRONMENT = "environment",
}
export enum BulkActions {
  DUPLICATE = "DUPLICATE",
  DELETE = "DELETE",
  MOVE = "MOVE",
  EXPORT = "EXPORT",
  SELECT_ALL = "SELECT_ALL",
}

export enum ApiClientImporterType {
  REQUESTLY = "REQUESTLY",
  POSTMAN = "POSTMAN",
  BRUNO = "BRUNO",
  CURL = "CURL",
}

export type CollectionVariableMap = Record<string, { variables: EnvironmentVariables }>;

export namespace RQAPI {
  export type AnalyticsEventSource =
    | "home_screen"
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

  export type Auth = {
    currentAuthType: Authorization.Type;
    authConfigStore: {
      [Authorization.Type.API_KEY]?: ApiKeyAuthorizationConfig["config"];
      [Authorization.Type.BEARER_TOKEN]?: BearerTokenAuthorizationConfig["config"];
      [Authorization.Type.BASIC_AUTH]?: BasicAuthAuthorizationConfig["config"];
    };
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
    auth: Auth;
  }

  export enum ExecutionStatus {
    SUCCESS = "success",
    ERROR = "error",
  }

  export type ExecutionError = {
    type: RQAPI.ApiClientErrorType;
    source: string;
    name: Error["name"];
    message: Error["message"];
  };

  export type ExecutionWarning = {
    message: string;
    description: string;
  };

  export type ExecutionResult =
    | {
        status: ExecutionStatus.SUCCESS;
        executedEntry: RQAPI.Entry;
        warning?: ExecutionWarning;
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
    auth: Auth;
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

  export type RecordPromise = Promise<{ success: boolean; data: Record; message?: string }>;

  export type RecordsPromise = Promise<{
    success: boolean;
    data: { records: Record[]; erroredRecords: ErroredRecord[] };
    message?: string;
  }>;

  export enum ApiClientErrorType {
    PRE_VALIDATION = "pre_validation",
    CORE = "core",
    ABORT = "abort",
    SCRIPT = "script",
  }
}
