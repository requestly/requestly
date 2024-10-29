import { PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";
import { InitialState } from "./types";

const initialState = {
  currentEnvironment: "",
  environments: {},
};

const resetState = (): InitialState => initialState;

const addNewEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    id: string;
    name: string;
  }>
) => {
  state.environments[action.payload.id] = {
    id: action.payload.id,
    variables: {},
    name: action.payload.name,
  };
};

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
  state.environments = action.payload.environmentMap;
};

const setVariablesInEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    newVariables: EnvironmentVariables;
    environmentId: string;
  }>
) => {
  state.environments[action.payload.environmentId].variables = action.payload.newVariables;
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
  addNewEnvironment,
  resetState,
  removeVariableFromEnvironment,
  setAllEnvironmentData,
  setCurrentEnvironment,
  setVariablesInEnvironment,
};

export { initialState };
export default environmentVariablesReducerFunctions;
