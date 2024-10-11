export interface EnvironmentVariableValue {
  localValue?: string | number | boolean;
  syncValue: string | number | boolean;
  type: string | number | boolean;
}

export type EnvironmentVariable = Record<string, EnvironmentVariableValue>;

export type EnvironmentVariableTable = EnvironmentVariableValue & { key: string; id: number };

export enum VariableType {
  String = "String",
  Number = "Number",
  Boolean = "Boolean",
}
