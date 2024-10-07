export interface EnvironmentVariableValue {
  localValue?: string | number | boolean;
  syncValue: string | number | boolean;
  // type: string | number | boolean;
}

export type EnvironmentVariable = Record<string, EnvironmentVariableValue>;
