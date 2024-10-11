import { createSlice } from "@reduxjs/toolkit";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";
import reducerFunctions, { initialState } from "./reducers";

const slice = createSlice({
  name: ReducerKeys.ENVIRONMENT,
  initialState,
  reducers: reducerFunctions,
});

const { actions, reducer } = slice;

export const environmentVariablesActions = actions;
export const environmentVariablesReducer = getReducerWithLocalStorageSync(ReducerKeys.ENVIRONMENT, reducer, [
  "currentEnvironment",
  "environments",
]);
