import { createSelector } from "@reduxjs/toolkit";
import { providersAdapter, secretsAdapter } from "./adapters";
import { SecretsManagerState, PendingSecretEntry } from "./types";

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

const selectAllPendingEntries = createSelector(selectSecretsManagerSlice, (slice) => slice.pendingEntries);

export const selectPendingEntriesForSelectedProvider = createSelector(
  [selectAllPendingEntries, selectSelectedProviderId],
  (pendingEntries, selectedProviderId): PendingSecretEntry[] => {
    if (!selectedProviderId) return [];
    return pendingEntries[selectedProviderId] ?? [];
  }
);

export const selectHasPendingEntries = createSelector([selectAllPendingEntries], (pendingEntries) => {
  return Object.values(pendingEntries).some((entries) => entries.length > 0);
});

export const selectAllAliasesForProvider = (state: RootState, providerId: string): string[] => {
  const allSecrets = secretsAdapterSelectors.selectAll(state);
  const secretAliases = allSecrets
    .filter((s) => s.providerId === providerId)
    .map((s) => s.secretReference.alias)
    .filter(Boolean);

  const pendingEntries = state.secretsManager.pendingEntries[providerId] ?? [];
  const pendingAliases = pendingEntries.map((e) => e.alias).filter(Boolean);

  return [...secretAliases, ...pendingAliases];
};
