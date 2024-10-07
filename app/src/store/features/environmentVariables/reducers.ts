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
  state.variables[action.payload.environment] = {
    ...state.variables[action.payload.environment],
    ...Object.fromEntries(
      Object.entries(action.payload.newVariables).map(([key, value]) => {
        const prevValue = state.variables[action.payload.environment]?.[key];
        return [
          key,
          {
            localValue: value.localValue ?? prevValue?.localValue,
            syncValue: value.syncValue ?? prevValue?.syncValue,
          },
        ];
      })
    ),
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
