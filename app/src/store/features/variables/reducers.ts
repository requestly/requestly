import { PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";
import { InitialState } from "./types";

const initialState = {
  currentEnvironment: "",
  environments: {},
  api_collections: {},
};

const resetState = (): InitialState => initialState;

const addNewEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    id: string;
    name: string;
    ownerId: string;
  }>
) => {
  state.environments[action.payload.ownerId][action.payload.id] = {
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
    ownerId: string;
  }>
) => {
  state.environments = {
    ...state.environments,
    [action.payload.ownerId]: action.payload.environmentMap,
  };
};

const updateEnvironmentData = (
  state: InitialState,
  action: PayloadAction<{
    newVariables: EnvironmentVariables;
    environmentId: string;
    ownerId: string;
    environmentName?: string;
  }>
) => {
  state.environments[action.payload.ownerId][action.payload.environmentId].variables = action.payload.newVariables;
  if (action.payload.environmentName) {
    state.environments[action.payload.ownerId][action.payload.environmentId].name = action.payload.environmentName;
  }
};

const removeVariableFromEnvironment = (
  state: InitialState,
  action: PayloadAction<{
    key: string;
    environmentId: string;
    ownerId: string;
  }>
) => {
  delete state.environments[action.payload.ownerId][action.payload.environmentId].variables[action.payload.key];
};

const removeEnvironment = (state: InitialState, action: PayloadAction<{ environmentId: string; ownerId: string }>) => {
  delete state.environments[action.payload.ownerId][action.payload.environmentId];
};

const updateEnvironmentName = (
  state: InitialState,
  action: PayloadAction<{ environmentId: string; newName: string; ownerId: string }>
) => {
  state.environments[action.payload.ownerId][action.payload.environmentId].name = action.payload.newName;
};

const setCollectionVariables = (
  state: InitialState,
  action: PayloadAction<{ collectionId: string; variables: EnvironmentVariables }>
) => {
  state.api_collections = {
    ...state.api_collections,
    [action.payload.collectionId]: { variables: action.payload.variables },
  };
};

const environmentVariablesReducerFunctions = {
  addNewEnvironment,
  resetState,
  removeVariableFromEnvironment,
  setAllEnvironmentData,
  setCurrentEnvironment,
  updateEnvironmentData,
  removeEnvironment,
  updateEnvironmentName,
  setCollectionVariables,
};

export { initialState };
export default environmentVariablesReducerFunctions;
