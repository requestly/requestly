export type VariableKey = string;

type BaseVariableData = {
  isPersisted?: boolean;
  syncValue?: VariableValueType;
  localValue?: VariableValueType;
  type: EnvironmentVariableType;
  id: number;
};

export interface EnvironmentVariableData extends BaseVariableData {
  isPersisted: true;
}

export type VariableData = EnvironmentVariableData | BaseVariableData;

export type IVariableValues<T extends VariableData> = Record<VariableKey, T>;

export type VariableValues = IVariableValues<VariableData>;

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
}

export enum VariableScope {
  RUNTIME = "runtime",
  ENVIRONMENT = "environment",
  COLLECTION = "collection",
  GLOBAL = "global",
}
