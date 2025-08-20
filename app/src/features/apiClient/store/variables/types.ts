import { EnvironmentVariableType, VariableValueType } from "backend/environment/types";
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
