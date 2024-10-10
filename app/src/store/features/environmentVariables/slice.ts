import { createSlice } from "@reduxjs/toolkit";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";
import reducerFunctions, { initialState } from "./reducers";

const slice = createSlice({
  name: ReducerKeys.ENVIRONMENT_VARIABLES,
  initialState,
  reducers: reducerFunctions,
});

const { actions, reducer } = slice;

export const environmentVariablesActions = actions;
export const environmentVariablesReducer = getReducerWithLocalStorageSync(ReducerKeys.ENVIRONMENT_VARIABLES, reducer, [
  "variables",
]);
