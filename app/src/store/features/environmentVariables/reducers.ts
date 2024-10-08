import { PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentVariable } from "backend/environmentVariables/types";

interface InitialState {
  variables: Record<string, EnvironmentVariable>;
}

const initialState = {
  variables: {},
};

const resetState = (): InitialState => initialState;

const setVariables = (
  state: InitialState,
  action: PayloadAction<{
    newVariables: EnvironmentVariable;
    environment: string;
  }>
) => {
  const currentEnvironmentVariables = state.variables[action.payload.environment] || ({} as EnvironmentVariable);

  const updatedVariables = Object.entries(action.payload.newVariables).reduce((acc, [key, value]) => {
    const prevValue = currentEnvironmentVariables[key];
    acc[key] = {
      localValue: value.localValue ?? prevValue.localValue,
      syncValue: value.syncValue ?? prevValue.syncValue,
      type: value.type,
    };
    return acc;
  }, {} as EnvironmentVariable);

  state.variables[action.payload.environment] = {
    ...currentEnvironmentVariables,
    ...updatedVariables,
  };
};

const removeVariable = (
  state: InitialState,
  action: PayloadAction<{
    environment: string;
    key: string;
  }>
) => {
  delete state.variables[action.payload.environment][action.payload.key];
};

const environmentVariablesReducerFunctions = {
  resetState,
  setVariables,
  removeVariable,
};

export { initialState };
export default environmentVariablesReducerFunctions;
