import { EnvironmentVariableData, IVariableValues } from "features/apiClient/store/variables/types";

// TODO: move all in types "features/apiClient"
export type VariableValueType = string | number | boolean;

export type EnvironmentVariables = IVariableValues<EnvironmentVariableData>;

export interface EnvironmentData {
  id: string;
  name: string;
  variables: IVariableValues<EnvironmentVariableData>;
}

export type EnvironmentMap = Record<string, EnvironmentData>;

export enum EnvironmentVariableType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Secret = "secret",
  Enum = "enum",
}

export enum VariableScope {
  RUNTIME = "runtime",
  ENVIRONMENT = "environment",
  COLLECTION = "collection",
  GLOBAL = "global",
}
