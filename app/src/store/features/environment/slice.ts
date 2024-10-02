import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentVariableValue } from "backend/environmentVariables/types";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

const initialState = {
  variables: {} as Record<string, Record<string, EnvironmentVariableValue>>,
};

const slice = createSlice({
  name: ReducerKeys.ENVIRONMENT,
  initialState,
  reducers: {
    resetState: () => initialState,
    setVariables: (
      state,
      action: PayloadAction<{
        newVariables: Record<string, EnvironmentVariableValue>;
        environment: string;
      }>
    ) => {
      state.variables = {
        ...state.variables,
        [action.payload.environment]: {
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
        },
      };
    },
  },
});

const { actions, reducer } = slice;

export const environmentVariablesActions = actions;
export const environmentVariablesReducer = getReducerWithLocalStorageSync(ReducerKeys.ENVIRONMENT, reducer, [
  "variables",
]);
