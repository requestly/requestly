import { VariableValueType } from "backend/environment/types";
import { VariableKey } from "../variables/types";
import { runtimeVariablesStore, RuntimeVariableValue } from "./runtimeVariables.store";

export type RuntimeVariables = Record<VariableKey, RuntimeVariableValue>;

export const getParsedRuntimeVariables = (): RuntimeVariables => {
  return Object.fromEntries(runtimeVariablesStore.getState().getAll());
};

export const setRuntimeStore = (patch: RuntimeVariables) => {
  const finalVariables = new Map(Object.entries(patch).map(([key, value], index) => [key, { ...value, id: index }]));

  runtimeVariablesStore.getState().reset(finalVariables);
};

export type Primitive = VariableValueType | undefined;

export const mapRuntimeArray = (variables: RuntimeVariables) => {
  return Object.keys(variables).map((key) => ({
    key,
    ...variables[key],
  }));
};
