import { EnvironmentVariableValue } from "backend/environmentVariables/types";
import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";

export const getAllEnvironmentVariables = (
  state: RootState
): Record<string, Record<string, EnvironmentVariableValue>> => {
  return state[ReducerKeys.ENVIRONMENT_VARIABLES].variables;
};
