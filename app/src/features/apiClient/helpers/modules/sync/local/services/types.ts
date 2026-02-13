import { EnvironmentVariableType, VariableValueType } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import { ErrorCode } from "../../../../../../../errors/types";

export type FileSystemError = {
  type: "error";
  error: {
    message: string;
    path: string;
    fileType: FileType;
    code: ErrorCode;
    metadata?: Record<string, any>;
  };
};
export type ContentfulSuccess<T> = T extends void ? { type: "success" } : { type: "success"; content: T };
export type FileSystemResult<T> = ContentfulSuccess<T> | FileSystemError;

export type Collection = {
  type: "collection";
  collectionId?: string;
  id: string;
  name: string;
  variables?: Record<string, any>;
  description?: string;
  auth?: RQAPI.Auth;
};

export type BaseApiRequestDetails = {
  url: string;
  auth: RQAPI.Auth;
  rank?: string;
  scripts: {
    preRequest: string;
    postResponse: string;
  };
};

export type ApiRequestDetails =
  | (BaseApiRequestDetails & RQAPI.HttpRequest & { type: RQAPI.ApiEntryType.HTTP })
  | (BaseApiRequestDetails & RQAPI.GraphQLRequest & { type: RQAPI.ApiEntryType.GRAPHQL });

export type API = {
  type: "api";
  collectionId?: string;
  id: string;
  data: {
    name: string;
    rank?: string;
    request: ApiRequestDetails;
  };
};

export type VariableEntity = Record<
  string,
  {
    id: number;
    value: VariableValueType;
    type: EnvironmentVariableType;
    isSecret: boolean;
    isPresisted: true;
  }
>;

export type EnvironmentEntity = {
  type: "environment";
  id: string;
  name: string;
  isGlobal: boolean;
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
