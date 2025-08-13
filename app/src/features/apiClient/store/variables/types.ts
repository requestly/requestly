import {
  EnvironmentVariableType,
  EnvironmentVariableValue,
  VariableScope,
  VariableValueType,
} from "backend/environment/types";

export type VariableData = {
  syncValue?: VariableValueType;
  type: EnvironmentVariableType;
  id: number;
};

export type VariableKey = string;

export type VariableDataForScope<T extends VariableScope> = T extends VariableScope.RUNTIME
  ? VariableData
  : EnvironmentVariableValue;
