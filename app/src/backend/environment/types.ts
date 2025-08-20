import { NewVariableData, VariableKey } from "features/apiClient/store/variables/types";

// TODO: move all in types "features/apiClient"
export type VariableValueType = string | number | boolean;

export type EnvironmentVariableKey = VariableKey;
// export interface EnvironmentVariableValue extends VariableData {
//   localValue?: VariableValueType;
// }

export type EnvironmentVariableValue = NewVariableData & {isPersisted: true}

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
  RUNTIME = "runtime",
  ENVIRONMENT = "environment",
  COLLECTION = "collection",
  GLOBAL = "global",
}
