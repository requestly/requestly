import { PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentVariable } from "backend/environment/types";
import { InitialState } from "./types";

const initialState = {
  currentEnvironment: {
    name: "default",
  },
  variables: {},
};

const resetState = (): InitialState => initialState;

const setEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    environmentName: string;
  }>
) => {
  state.currentEnvironment.name = action.payload.environmentName;
};

const setVariables = (
  state: InitialState,
  action: PayloadAction<{
    newVariables: EnvironmentVariable;
  }>
) => {
  const currentEnvironmentVariables = state.variables;

  const updatedVariables: EnvironmentVariable = Object.fromEntries(
    Object.entries(action.payload.newVariables).map(([key, value]) => {
      const prevValue = currentEnvironmentVariables[key];
      const updatedValue = {
        localValue: value.localValue ?? prevValue?.localValue,
        syncValue: value.syncValue ?? prevValue?.syncValue,
        type: value.type,
      };

      // Remove localValue if it doesn't exist
      if (!updatedValue.localValue) {
        delete updatedValue.localValue;
      }

      return [key, updatedValue];
    })
  );

  state.variables = {
    ...currentEnvironmentVariables,
    ...updatedVariables,
  };
};

const removeVariable = (
  state: InitialState,
  action: PayloadAction<{
    key: string;
  }>
) => {
  delete state.variables[action.payload.key];
};

const environmentVariablesReducerFunctions = {
  resetState,
  setVariables,
  removeVariable,
  setEnvironment,
};

export { initialState };
export default environmentVariablesReducerFunctions;
