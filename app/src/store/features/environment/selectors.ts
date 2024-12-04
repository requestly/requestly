import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { InitialState } from "./types";

export const getAllEnvironmentData = (state: RootState): InitialState["environments"] => {
  return state[ReducerKeys.ENVIRONMENT].environments;
};

export const getCurrentEnvironmentId = (state: RootState): InitialState["currentEnvironment"] => {
  return state[ReducerKeys.ENVIRONMENT].currentEnvironment;
};

export const getCollectionVariables = (state: RootState): InitialState["api_collections"] => {
  return state[ReducerKeys.ENVIRONMENT].api_collections;
};
