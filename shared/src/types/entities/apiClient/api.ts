import { EnvironmentVariables } from "./env";

export interface API_KEY_FORM_VALUES {
  key: string;
  value: string;
  addTo: "HEADER" | "QUERY";
}

export interface BEARER_TOKEN_FORM_VALUES {
  bearer: string;
}

export interface BASIC_AUTH_FORM_VALUES {
  username?: string;
  password?: string;
}

export type AUTH_OPTIONS = API_KEY_FORM_VALUES | BEARER_TOKEN_FORM_VALUES | BASIC_AUTH_FORM_VALUES;

export namespace Authorization {
  export enum Type {
    INHERIT = "INHERIT",
    NO_AUTH = "NO_AUTH",
    API_KEY = "API_KEY",
    BEARER_TOKEN = "BEARER_TOKEN",
    BASIC_AUTH = "BASIC_AUTH",
  }

  type AddToOptions = "HEADER" | "QUERY";
  export type API_KEY_CONFIG = {
    key: string;
    value: string;
    addTo: AddToOptions;
  };

  export type BEARER_TOKEN_CONFIG = {
    bearer: string;
  };

  export type BASIC_AUTH_CONFIG = {
    username?: string;
    password?: string;
  };

  export const requiresConfig = (type: Type): type is AuthConfigMeta.AuthWithConfig => {
    return ![Type.NO_AUTH, Type.INHERIT].includes(type);
  };

  export const hasNoConfig = (type: Type): type is AuthConfigMeta.NoConfigAuth => {
    return [Type.NO_AUTH, Type.INHERIT].includes(type);
  };
}

export namespace AuthConfigMeta {
  export type TypeToConfig = {
    [Authorization.Type.API_KEY]: Authorization.API_KEY_CONFIG;
    [Authorization.Type.BEARER_TOKEN]: Authorization.BEARER_TOKEN_CONFIG;
    [Authorization.Type.BASIC_AUTH]: Authorization.BASIC_AUTH_CONFIG;
    [Authorization.Type.NO_AUTH]: never;
    [Authorization.Type.INHERIT]: never;
  };

  type HasConfig<T extends Authorization.Type> = TypeToConfig[T] extends never ? false : true;

  export type AuthWithConfig = {
    [K in Authorization.Type]: HasConfig<K> extends true ? K : never;
  }[Authorization.Type];

  export type NoConfigAuth = {
    [K in Authorization.Type]: HasConfig<K> extends false ? K : never;
  }[Authorization.Type];
}

export abstract class AuthConfig<T extends AuthConfigMeta.AuthWithConfig> {
  abstract validate(): boolean;
  abstract readonly type: T;
  abstract get config(): AuthConfigMeta.TypeToConfig[T] | null;
}

export class ApiKeyAuthorizationConfig implements AuthConfig<Authorization.Type.API_KEY> {
  key: string;
  value: string;
  addTo: Authorization.API_KEY_CONFIG["addTo"];

  type: Authorization.Type.API_KEY = Authorization.Type.API_KEY;

  constructor(key: string, value: string, addTo: Authorization.API_KEY_CONFIG["addTo"] = "HEADER") {
    this.key = key;
    this.value = value;
    this.addTo = addTo;
  }

  validate(): boolean {
    return Boolean(this.key && this.value);
  }

  get config(): AuthConfigMeta.TypeToConfig[Authorization.Type.API_KEY] | null {
    if (!this.validate()) {
      // throw new Error("Invalid API Key Authorization Config");
      return null;
    }
    return {
      key: this.key,
      value: this.value,
      addTo: this.addTo,
    };
  }
}

export class BearerTokenAuthorizationConfig implements AuthConfig<Authorization.Type.BEARER_TOKEN> {
  bearer: string;

  type: Authorization.Type.BEARER_TOKEN = Authorization.Type.BEARER_TOKEN;

  constructor(bearer: string) {
    this.bearer = bearer;
  }

  validate(): boolean {
    return Boolean(this.bearer);
  }

  get config(): AuthConfigMeta.TypeToConfig[Authorization.Type.BEARER_TOKEN] | null {
    if (!this.validate()) {
      // throw new Error("Invalid Bearer Token Authorization Config");
      return null;
    }
    return {
      bearer: this.bearer,
    };
  }
}

export class BasicAuthAuthorizationConfig implements AuthConfig<Authorization.Type.BASIC_AUTH> {
  username?: string;
  password?: string;

  type: Authorization.Type.BASIC_AUTH = Authorization.Type.BASIC_AUTH;

  constructor(username?: string, password?: string) {
    this.username = username;
    this.password = password;
  }

  validate(): boolean {
    return true;
  }

  get config(): AuthConfigMeta.TypeToConfig[Authorization.Type.BASIC_AUTH] | null {
    return {
      username: this.username,
      password: this.password,
    };
  }
}

export enum TestStatus {
  PASSED = "passed",
  FAILED = "failed",
  SKIPPED = "skipped",
}

export interface BaseTestResult {
  name: string;
  status: TestStatus;
}

export interface PassedTestResult extends BaseTestResult {
  status: TestStatus.PASSED;
}

export interface FailedTestResult extends BaseTestResult {
  status: TestStatus.FAILED;
  error: string;
}

export interface SkippedTestResult extends BaseTestResult {
  status: TestStatus.SKIPPED;
}

export type TestResult = PassedTestResult | FailedTestResult | SkippedTestResult;

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

  type MultipartFileValue = {
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
    method: RequestMethod;
    pathVariables?: PathVariable[];
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
    rank?: string;
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

  export enum FileType {
    API = "api",
    ENVIRONMENT = "environment",
    COLLECTION_VARIABLES = "collection_variables",
    DESCRIPTION = "description",
    AUTH = "auth",
    UNKNOWN = "unknown",
  }

  export type ErroredRecord = {
    name: string;
    path: string;
    error: string;
    type: FileType;
  };

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

  export type RunOrder = ApiClientRecord["id"][];

  export type RunConfig = {
    id: string;
    runOrder: RunOrder;
    iterations: number;
    delay: number;

    // TODO: add more as we go

    createdTs: number;
    updatedTs: number;
  };
}
