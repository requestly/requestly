import { createSelector } from "@reduxjs/toolkit";
import { providersAdapter, secretsAdapter } from "./adapters";
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

export const selectSecretsByProviderId = createSelector([selectAllSecrets], (secrets) => (providerId: string) => {
  return secrets.filter((s) => s.providerId === providerId);
});

export const selectLastFetchedForSelectedProvider = createSelector([selectSecretsForSelectedProvider], (secrets) => {
  const fetched = secrets.filter((s) => s.fetchedAt > 0);
  if (fetched.length === 0) return null;
  return Math.max(...fetched.map((s) => s.fetchedAt));
});

export const selectIsDirtyForSelectedProvider = createSelector(selectSecretsManagerSlice, (slice) => slice.isDirty);

export const selectFetchErrors = createSelector(selectSecretsManagerSlice, (slice) => slice.fetchErrors);

export const selectValidationErrors = createSelector(selectSecretsManagerSlice, (slice) => slice.validationErrors);
