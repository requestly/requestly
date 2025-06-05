export type VariableValueType = string | number | boolean;

export interface EnvironmentVariableValue {
  localValue?: VariableValueType;
  syncValue?: VariableValueType;
  type: EnvironmentVariableType;
  id: number;
}

export type EnvironmentVariables = Record<string, EnvironmentVariableValue>;

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
  key: string;
};

export enum VariableScope {
  GLOBAL = "global",
  ENVIRONMENT = "environment",
  COLLECTION = "collection",
}
