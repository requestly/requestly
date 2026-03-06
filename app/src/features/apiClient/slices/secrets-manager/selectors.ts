import { createSelector } from "@reduxjs/toolkit";
import { providersAdapter, secretsAdapter } from "./slice";
import { SecretsManagerState } from "./types";

type RootState = { secretsManager: SecretsManagerState };

const selectSecretsManagerSlice = (state: RootState) => state.secretsManager;

const selectProvidersState = createSelector(selectSecretsManagerSlice, (slice) => slice.providers);
const providersAdapterSelectors = providersAdapter.getSelectors(selectProvidersState);

const selectSecretsState = createSelector(selectSecretsManagerSlice, (slice) => slice.secrets);
const secretsAdapterSelectors = secretsAdapter.getSelectors(selectSecretsState);

export const selectAllSecretProviders = providersAdapterSelectors.selectAll;
export const selectSecretProviderById = (state: RootState, id: string) =>
  providersAdapterSelectors.selectById(state, id);

export const selectAllSecrets = secretsAdapterSelectors.selectAll;
export const selectSecretById = (state: RootState, id: string) => secretsAdapterSelectors.selectById(state, id);

export const selectSelectedProviderId = createSelector(selectSecretsManagerSlice, (slice) => slice.selectedProviderId);

export const selectFetchStatus = createSelector(selectSecretsManagerSlice, (slice) => slice.fetchStatus);

export const selectSecretsForSelectedProvider = createSelector(
  [selectAllSecrets, selectSelectedProviderId],
  (secrets, selectedProviderId) => {
    if (!selectedProviderId) return [];
    return secrets.filter((s) => s.providerId === selectedProviderId);
  }
);

export const selectLastFetchedForSelectedProvider = createSelector([selectSecretsForSelectedProvider], (secrets) => {
  if (secrets.length === 0) return null;
  return Math.max(...secrets.map((s) => s.fetchedAt));
});
