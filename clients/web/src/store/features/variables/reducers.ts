import { PayloadAction } from "@reduxjs/toolkit";
import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";
import { InitialState } from "./types";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";

const initialState = {
  currentEnvironment: "",
  environments: {},
  api_collections: {},
  errorEnvFiles: [] as ErroredRecord[],
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
  if (!state.environments[action.payload.ownerId]) {
    return;
  }

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

const updateAllEnvironmentData = (
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
  if (
    !state.environments[action.payload.ownerId] ||
    !state.environments[action.payload.ownerId]?.[action.payload.environmentId]
  ) {
    return;
  }

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

const updateCollectionVariables = (
  state: InitialState,
  action: PayloadAction<{ collectionId: string; variables: EnvironmentVariables }>
) => {
  state.api_collections = {
    ...state.api_collections,
    [action.payload.collectionId]: { variables: action.payload.variables },
  };
};

const setCollectionVariables = (
  state: InitialState,
  action: PayloadAction<Record<string, { variables: EnvironmentVariables }>>
) => {
  state.api_collections = action.payload;
};

const setErrorEnvFiles = (state: InitialState, action: PayloadAction<ErroredRecord[]>) => {
  state.errorEnvFiles = action.payload;
};

const environmentVariablesReducerFunctions = {
  addNewEnvironment,
  resetState,
  removeVariableFromEnvironment,
  updateAllEnvironmentData,
  setCurrentEnvironment,
  updateEnvironmentData,
  removeEnvironment,
  updateEnvironmentName,
  updateCollectionVariables,
  setCollectionVariables,
  setErrorEnvFiles,
};

export { initialState };
export default environmentVariablesReducerFunctions;
