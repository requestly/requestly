import { PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";
import { InitialState } from "./types";
import { mergeLocalAndSyncVariables } from "./utils";

const initialState = {
  currentEnvironment: "",
  environments: {},
};

const resetState = (): InitialState => initialState;

const setCurrentEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    environmentId: string;
  }>
) => {
  state.currentEnvironment = action.payload.environmentId;
};

const setAllEnvironmentData = (
  state: InitialState,
  action: PayloadAction<{
    environmentMap: EnvironmentMap;
  }>
) => {
  let updatedEnvironments: EnvironmentMap = {};

  if (Object.keys(state.environments).length === 0) {
    updatedEnvironments = action.payload.environmentMap;
  } else {
    Object.keys(action.payload.environmentMap).forEach((key) => {
      updatedEnvironments[key] = {
        ...state.environments[key],
        variables: mergeLocalAndSyncVariables(
          state.environments[key].variables,
          action.payload.environmentMap[key].variables
        ),
      };
    });
  }

  state.environments = updatedEnvironments;
};

const setVariablesInEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    newVariables: EnvironmentVariables;
    environmentId: string;
  }>
) => {
  const currentEnvironmentVariables = state.environments[action.payload.environmentId].variables;

  const updatedVariables = mergeLocalAndSyncVariables(currentEnvironmentVariables, action.payload.newVariables);

  state.environments[action.payload.environmentId].variables = updatedVariables;
};

const removeVariableFromEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    key: string;
    environmentId: string;
  }>
) => {
  delete state.environments[action.payload.environmentId].variables[action.payload.key];
};

const environmentVariablesReducerFunctions = {
  resetState,
  setAllEnvironmentData,
  setVariablesInEnvironment,
  removeVariableFromEnvironment,
  setCurrentEnvironment,
};

export { initialState };
export default environmentVariablesReducerFunctions;
