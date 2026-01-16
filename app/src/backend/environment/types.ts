import { EnvironmentVariableData, IVariableValues } from "@requestly/shared/types/entities/apiClient";

// TODO: move all in types "features/apiClient"
export type VariableValueType = string | number | boolean;

export type EnvironmentVariables = IVariableValues<EnvironmentVariableData>;

export interface EnvironmentData {
  id: string;
  name: string;
  variables: IVariableValues<EnvironmentVariableData>;
  variablesOrder?: string[]; // Array of variable keys in display order
}

export type EnvironmentMap = Record<string, EnvironmentData>;

export enum EnvironmentVariableType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Secret = "secret",
}

export enum VariableScope {
  DATA_FILE = "data_file",
  RUNTIME = "runtime",
  ENVIRONMENT = "environment",
  COLLECTION = "collection",
  GLOBAL = "global",
}
