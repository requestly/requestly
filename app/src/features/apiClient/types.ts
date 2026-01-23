import { EnvironmentVariables } from "backend/environment/types";
import { TestResult } from "./helpers/modules/scriptsV2/worker/script-internals/types";
import {
  ApiKeyAuthorizationConfig,
  Authorization,
  BasicAuthAuthorizationConfig,
  BearerTokenAuthorizationConfig,
} from "./screens/apiClient/components/views/components/request/components/AuthorizationView/types/AuthConfig";
import { ErroredRecord } from "./helpers/modules/sync/local/services/types";
import { ApiClientFile, FileId } from "./store/apiClientFilesStore";

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

export enum FormDropDownOptions {
  "FILE" = "file",
  "TEXT" = "text",
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

export interface KeyValuePair {
  id: number;
  key: string;
  value: string;
  isEnabled: boolean;
  type?: string; // added for special identifiers like auth
  description?: string;
  dataType?: KeyValueDataType;
}

export enum KeyValueDataType {
  STRING = "string",
  NUMBER = "number",
  INTEGER = "integer",
  BOOLEAN = "boolean",
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
  EXPORT_REQUESTLY = "EXPORT_REQUESTLY",
  EXPORT_POSTMAN = "EXPORT_POSTMAN",
  SELECT_ALL = "SELECT_ALL",
}

export enum ApiClientImporterType {
  REQUESTLY = "REQUESTLY",
  POSTMAN = "POSTMAN",
  BRUNO = "BRUNO",
  CURL = "CURL",
  OPENAPI = "OPENAPI",
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

  export type PathVariable = {
    id: number;
    key: string;
    value: string;
    description?: string;
    dataType?: KeyValueDataType;
  };

  export type RequestBody = RequestJsonBody | RequestRawBody | RequestFormBody | MultipartFormBody; // in case of form data, body will be key-value pairs
  export type RequestJsonBody = string;
  export type RequestRawBody = string;
  export type RequestHtmlBody = string;
  export type RequestJavascriptBody = string;
  export type RequestXmlBody = string;
  export type RequestFormBody = KeyValuePair[];
  export type MultipartFormBody = FormDataKeyValuePair[];
  // TODO:nafees will need to add discriminant based on contentType

  export type FormDataKeyValuePair = KeyValuePair & {
    value: string | MultipartFileValue[];
  };

  export type MultipartFileValue = {
    id: string; // file id for each multipart key value pair
    name: string;
    path: string;
    size: number;
    source: "extension" | "desktop";
  };

  export type RequestBodyContainer = {
    text?: string;
    form?: KeyValuePair[];
    multipartForm?: FormDataKeyValuePair[];
  };

  export type Auth = {
    currentAuthType: Authorization.Type;
    authConfigStore: {
      [Authorization.Type.API_KEY]?: ApiKeyAuthorizationConfig["config"];
      [Authorization.Type.BEARER_TOKEN]?: BearerTokenAuthorizationConfig["config"];
      [Authorization.Type.BASIC_AUTH]?: BasicAuthAuthorizationConfig["config"];
    };
  };

  export type HttpRequest = {
    url: string;
    queryParams: KeyValuePair[];
    pathVariables?: PathVariable[];
    method: RequestMethod;
    headers: KeyValuePair[];
    body?: RequestBody;
    bodyContainer?: RequestBodyContainer;
    contentType?: RequestContentType;
    includeCredentials?: boolean;
  };

  export type HttpResponse = {
    body: string;
    headers: KeyValuePair[];
    status: number;
    statusText: string;
    time: number;
    redirectedUrl: string;
  } | null;

  export type HttpSpec = {
    request: HttpRequest;
    response: HttpResponse;
  };

  export type GraphQLRequest = {
    url: string;
    headers: KeyValuePair[];
    operation: string;
    variables: string;
    operationName?: string;
  };

  export type GraphQLResponse = {
    type: "http" | "ws";
    body: string;
    headers: KeyValuePair[];
    status: number;
    statusText: string;
    time: number;
  } | null;

  export type ApiEntryMetaData = {
    testResults?: TestResult[];
    scripts?: {
      preRequest: string;
      postResponse: string;
    };
    auth: Auth;
  };

  export enum ApiEntryType {
    HTTP = "http",
    GRAPHQL = "graphql",
  }

  export type ApiEntryMap<T extends ApiEntryType> = T extends ApiEntryType.HTTP
    ? HttpApiEntry
    : T extends ApiEntryType.GRAPHQL
    ? GraphQLApiEntry
    : never;

  export type GraphQLApiEntry = {
    request: GraphQLRequest;
    response: GraphQLResponse;
  } & ApiEntryMetaData & { type: ApiEntryType.GRAPHQL };

  export type HttpApiEntry = {
    request: HttpRequest;
    response: HttpResponse;
  } & ApiEntryMetaData & { type: ApiEntryType.HTTP };

  export type ApiEntry = GraphQLApiEntry | HttpApiEntry;

  export type Request = GraphQLRequest | HttpRequest;

  export type Response = GraphQLResponse | HttpResponse;

  export enum ExecutionStatus {
    SUCCESS = "success",
    ERROR = "error",
  }

  export type ExecutionError = {
    type: RQAPI.ApiClientErrorType;
    source: string;
    name: Error["name"];
    reason?: string;
    message: Error["message"];
  };

  export type ExecutionWarning = {
    message: string;
    description: string;
  };

  export type ExecutionResult =
    | {
        status: ExecutionStatus.SUCCESS;
        executedEntry: ApiEntry;
        warning?: ExecutionWarning;
      }
    | {
        status: ExecutionStatus.ERROR;
        executedEntry: ApiEntry;
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
    children?: ApiClientRecord[];
    scripts?: {
      preRequest: string;
      postResponse: string;
    };
    variables: Omit<EnvironmentVariables, "localValue">;
    auth: Auth;
  }

  export interface RecordMetadata {
    id: string;
    name: string;
    description?: string;
    collectionId: string | null;
    isExample?: boolean;
    ownerId: string;
    deleted: boolean;
    createdBy: string;
    updatedBy: string;
    createdTs: number;
    updatedTs: number;
  }

  export interface BaseApiRecord extends RecordMetadata {
    type: RecordType.API;
  }

  export interface CollectionRecord extends RecordMetadata {
    type: RecordType.COLLECTION;
    data: Collection;
  }

  export type ApiRecord = {
    type: RecordType.API;
    data: ApiEntry;
  } & BaseApiRecord;

  export type HttpApiRecord = ApiRecord & { data: HttpApiEntry };

  export type GraphQLApiRecord = ApiRecord & { data: GraphQLApiEntry };

  export type ApiClientRecord = ApiRecord | CollectionRecord;

  export type ApiClientRecordPromise = Promise<
    | {
        success: true;
        data: ApiClientRecord;
        message?: string;
      }
    | {
        success: false;
        data: null;
        message?: string;
        error?: Error;
      }
  >;

  export type RecordsPromise = Promise<{
    success: boolean;
    data: { records: ApiClientRecord[]; erroredRecords: ErroredRecord[] };
    message?: string;
  }>;

  export enum ApiClientErrorType {
    PRE_VALIDATION = "pre_validation",
    CORE = "core",
    ABORT = "abort",
    SCRIPT = "script",
    MISSING_FILE = "missing_file",
  }

  export type OrderedRequest = { record: ApiRecord; isSelected: boolean };

  export type OrderedRequests = OrderedRequest[];

  export type RunOrder = { id: ApiRecord["id"]; isSelected: boolean }[];

  export type RunConfig = {
    id: string;
    runOrder: RunOrder;
    iterations: number;
    delay: number;
    dataFile:
      | (Omit<ApiClientFile, "isFileValid"> & {
          id: FileId;
        })
      | null;
  };
}

export enum PostmanBodyMode {
  RAW = "raw",
  FORMDATA = "formdata",
  URL_ENCODED = "urlencoded",
  GRAPHQL = "graphql",
}

export enum AbortReason {
  USER_CANCELLED = "user_cancelled",
}

export type UnwrappedPromise<T> = T extends Promise<infer R> ? R : T;
