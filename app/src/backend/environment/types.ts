export interface EnvironmentVariableValue {
  localValue?: string | number | boolean;
  syncValue: string | number | boolean;
  type: string | number | boolean;
}

export type EnvironmentVariables = Record<string, EnvironmentVariableValue>;

export interface EnvironmentData {
  name: string;
  variables: EnvironmentVariables;
}

export type EnvironmentMap = Record<string, EnvironmentData>;
