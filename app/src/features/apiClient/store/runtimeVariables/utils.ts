import { VariableValueType } from "backend/environment/types";
import { VariableKey } from "../variables/types";
import { runtimeVariablesStore, RuntimeVariableValue } from "./runtimeVariables.store";

export type RuntimeVariables = Record<VariableKey, RuntimeVariableValue>;

export const getParsedRuntimeVariables = (): RuntimeVariables => {
  return Object.fromEntries(runtimeVariablesStore.getState().getAll());
};

export const patchRuntimeStore = (patch: RuntimeVariables) => {
  const currentVariables = runtimeVariablesStore.getState().getAll();
  const finalVariables = new Map(currentVariables);

  let counter = currentVariables.size;
  for (const key in patch) {
    if (finalVariables.has(key)) {
      const currentValue = currentVariables.get(key);
      finalVariables.set(key, {
        ...currentValue,
        ...patch[key],
        id: currentValue.id,
      });
    } else {
      finalVariables.set(key, {
        ...patch[key],
        id: counter,
      });
      counter++;
    }
  }

  runtimeVariablesStore.getState().reset(finalVariables);
};

export type Primitive = VariableValueType | undefined;

export const mapRuntimeArray = (variables: RuntimeVariables) => {
  return Object.keys(variables).map((key) => ({
    key,
    ...variables[key],
  }));
};
