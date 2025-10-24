import { createSlice } from "@reduxjs/toolkit";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";
import reducerFunctions, { initialState } from "./reducers";

const slice = createSlice({
  name: ReducerKeys.VARIABLES,
  initialState,
  reducers: reducerFunctions,
});

const { actions, reducer } = slice;

export const variablesActions = actions;
export const variablesReducer = getReducerWithLocalStorageSync(ReducerKeys.VARIABLES, reducer, [
  "currentEnvironment",
  "environments",
  "api_collections",
]);
