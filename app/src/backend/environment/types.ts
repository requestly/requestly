// TODO: move all in types "features/apiClient"
export type VariableValueType = string | number | boolean;

export type EnvironmentVariableKey = string;

export interface EnvironmentVariableValue {
  localValue?: VariableValueType;
  syncValue?: VariableValueType;
  type: EnvironmentVariableType;
  id: number;
}

export type EnvironmentVariables = Record<EnvironmentVariableKey, EnvironmentVariableValue>;

export interface EnvironmentData {
  id: string;
  name: string;
  variables: EnvironmentVariables;
}

export type EnvironmentMap = Record<string, EnvironmentData>;

export enum EnvironmentVariableType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Secret = "secret",
}

export type VariableExport = EnvironmentVariableValue & {
  key: EnvironmentVariableKey;
};

export enum VariableScope {
  GLOBAL = "global",
  ENVIRONMENT = "environment",
  COLLECTION = "collection",
}
