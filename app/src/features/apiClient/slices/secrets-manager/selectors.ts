import { createSelector } from "@reduxjs/toolkit";
import { providersAdapter, secretsAdapter } from "./slice";
import { SecretsManagerState } from "./types";

const selectSecretsManagerSlice = (state: { secretsManager: SecretsManagerState }) => state.secretsManager;

const selectProvidersState = createSelector(selectSecretsManagerSlice, (slice) => slice.providers);
const providersAdapterSelectors = providersAdapter.getSelectors(selectProvidersState);

const selectSecretsState = createSelector(selectSecretsManagerSlice, (slice) => slice.secrets);
const secretsAdapterSelectors = secretsAdapter.getSelectors(selectSecretsState);

export const selectAllSecretProviders = providersAdapterSelectors.selectAll;
export const selectSecretProviderById = (state: { secretsManager: SecretsManagerState }, id: string) =>
  providersAdapterSelectors.selectById(state, id);

export const selectAllSecrets = secretsAdapterSelectors.selectAll;
export const selectSecretById = (state: { secretsManager: SecretsManagerState }, id: string) =>
  secretsAdapterSelectors.selectById(state, id);
