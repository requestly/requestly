import { PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";
import { InitialState } from "./types";
import { mergeLocalAndSyncVariables } from "./utils";

const initialState = {
  currentEnvironment: {
    name: "default",
    variables: {},
  },
  environments: {},
};

const resetState = (): InitialState => initialState;

const setEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    environmentName: string;
  }>
) => {
  state.currentEnvironment = state.environments[action.payload.environmentName];
};

const setAllEnvironmentData = (
  state: InitialState,
  action: PayloadAction<{
    environmentMap: EnvironmentMap;
  }>
) => {
  if (Object.keys(state.environments).length === 0) {
    state.environments = action.payload.environmentMap;
    state.currentEnvironment = action.payload.environmentMap[state.currentEnvironment.name];
  } else {
    const updatedEnvironments: EnvironmentMap = {};
    Object.keys(action.payload.environmentMap).forEach((key) => {
      updatedEnvironments[key] = {
        ...state.environments[key],
        variables: mergeLocalAndSyncVariables(
          state.environments[key].variables,
          action.payload.environmentMap[key].variables
        ),
      };
    });

    state.environments = updatedEnvironments;
    state.currentEnvironment = updatedEnvironments[state.currentEnvironment.name];
  }
};

const setVariablesInEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    newVariables: EnvironmentVariables;
    environment: string;
  }>
) => {
  const currentEnvironmentVariables = state.environments[action.payload.environment].variables;

  const updatedVariables = mergeLocalAndSyncVariables(currentEnvironmentVariables, action.payload.newVariables);

  state.environments[action.payload.environment].variables = updatedVariables;
  state.currentEnvironment = state.environments[action.payload.environment];
};

const removeVariableFromEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    key: string;
    environment: string;
  }>
) => {
  delete state.environments[action.payload.environment].variables[action.payload.key];
  state.currentEnvironment = state.environments[action.payload.environment];
};

const environmentVariablesReducerFunctions = {
  resetState,
  setAllEnvironmentData,
  setVariablesInEnvironment,
  removeVariableFromEnvironment,
  setEnvironment,
};

export { initialState };
export default environmentVariablesReducerFunctions;
