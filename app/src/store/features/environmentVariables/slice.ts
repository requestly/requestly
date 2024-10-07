import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentVariable } from "backend/environmentVariables/types";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

const initialState = {
  variables: {} as Record<string, EnvironmentVariable>,
};

const slice = createSlice({
  name: ReducerKeys.ENVIRONMENT_VARIABLES,
  initialState,
  reducers: {
    resetState: () => initialState,
    setVariables: (
      state,
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
    },
    removeVariable: (
      state,
      action: PayloadAction<{
        environment: string;
        key: string;
      }>
    ) => {
      delete state.variables[action.payload.environment][action.payload.key];
    },
  },
});

const { actions, reducer } = slice;

export const environmentVariablesActions = actions;
export const environmentVariablesReducer = getReducerWithLocalStorageSync(ReducerKeys.ENVIRONMENT_VARIABLES, reducer, [
  "variables",
]);
