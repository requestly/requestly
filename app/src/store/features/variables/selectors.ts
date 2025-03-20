import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { InitialState } from "./types";

export const getAllEnvironmentData = (state: RootState): InitialState["environments"] => {
  return state[ReducerKeys.VARIABLES].environments;
};

export const getCurrentEnvironmentId = (state: RootState): InitialState["currentEnvironment"] => {
  return state[ReducerKeys.VARIABLES].currentEnvironment;
};

export const getCollectionVariables = (state: RootState): InitialState["api_collections"] => {
  return state[ReducerKeys.VARIABLES].api_collections;
};

export const getErrorEnvFiles = (state: RootState): InitialState["errorEnvFiles"] => {
  return state[ReducerKeys.VARIABLES].errorEnvFiles;
};
