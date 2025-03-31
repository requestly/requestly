import { EnvironmentVariableType, VariableValueType } from "backend/environment/types";
import { KeyValuePair, RequestContentType, RQAPI } from "features/apiClient/types";

export type FileSystemError = { message: string; path: string };
export type ContentfulSuccess<T> = T extends void ? { type: "success" } : { type: "success"; content: T };
export type FileSystemResult<T> =
  | ContentfulSuccess<T>
  | {
      type: "error";
      error: FileSystemError;
    };

export type Collection = {
  type: "collection";
  collectionId?: string;
  id: string;
  name: string;
  variables?: Record<string, any>;
  description?: string;
  auth?: RQAPI.Auth;
};

export type APIRequestDetails = {
  name: string;
  url: string;
  method: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  body?: RQAPI.RequestBody;
  bodyContainer: RQAPI.RequestBodyContainer;
  contentType: RequestContentType;
  auth?: RQAPI.Auth;
  scripts: {
    preRequest: string;
    postResponse: string;
  };
};

export type API = {
  type: "api";
  collectionId?: string;
  id: string;
  request: APIRequestDetails;
};

export type VariableEntity = Record<
  string,
  {
    id: number;
    value: VariableValueType;
    type: EnvironmentVariableType;
    isSecret: boolean;
  }
>;

export type EnvironmentEntity = {
  type: "environment";
  id: string;
  name: string;
  variables?: VariableEntity;
};

export type APIEntity = Collection | API;

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
