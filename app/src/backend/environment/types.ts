export interface EnvironmentVariableValue {
  localValue?: string | number | boolean;
  syncValue: string | number | boolean;
  type: string | number | boolean;
}

export type EnvironmentVariables = Record<string, EnvironmentVariableValue>;

export interface EnvironmentData {
  id: string;
  name: string;
  variables: EnvironmentVariables;
  isGlobal: boolean;
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
