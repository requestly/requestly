import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentVariableValue } from "backend/environmentVariables/types";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

const initialState = {
  variables: {} as Record<string, Record<string, EnvironmentVariableValue>>,
};

const slice = createSlice({
  name: ReducerKeys.ENVIRONMENT_VARIABLES,
  initialState,
  reducers: {
    resetState: () => initialState,
    setVariable: (
      state,
      action: PayloadAction<{
        newVariable: Record<string, EnvironmentVariableValue>;
        environment: string;
      }>
    ) => {
      state.variables = {
        ...state.variables,
        [action.payload.environment]: {
          ...state.variables[action.payload.environment],
          ...action.payload.newVariable,
        },
      };
    },
  },
});

const { actions, reducer } = slice;

export const environmentVariablesActions = actions;
export const environmentVariablesReducer = getReducerWithLocalStorageSync(ReducerKeys.ENVIRONMENT_VARIABLES, reducer, [
  "variables",
]);
