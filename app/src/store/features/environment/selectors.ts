import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { InitialState } from "./types";

export const getAllEnvironmentVariables = (state: RootState): InitialState["variables"] => {
  return state[ReducerKeys.ENVIRONMENT].variables;
};

export const getCurrentEnvironmentDetails = (state: RootState): InitialState["currentEnvironment"] => {
  return state[ReducerKeys.ENVIRONMENT].currentEnvironment;
};
