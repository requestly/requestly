import { createSelector } from "@reduxjs/toolkit";
import { providersAdapter, secretsAdapter } from "./adapters";
import { SecretsManagerState } from "./types";
import { AwsSecretValue } from "@requestly/shared/types/entities/secretsManager";

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

const selectSecretsSnapshot = createSelector(selectSecretsManagerSlice, (slice) => slice.secretsSnapshot);

export const selectIsDirtyForSelectedProvider = createSelector(
  [selectSecretsForSelectedProvider, selectSecretsSnapshot],
  (secrets, snapshot) => {
    // Filter out empty stub rows — they don't count as changes
    const meaningfulSecrets = secrets.filter((s) => {
      const ref = s.secretReference as AwsSecretValue["secretReference"];
      const alias = (s.secretReference.alias ?? "").trim();
      const identifier = (ref.identifier ?? "").trim();
      return alias !== "" && identifier !== "";
    });

    const snapshotIds = new Set(Object.keys(snapshot));
    const currentIds = new Set(meaningfulSecrets.map((s) => s.secretReference.id));

    // Any new meaningful secret not in snapshot = dirty
    for (const id of currentIds) {
      if (!snapshotIds.has(id)) return true;
    }

    // Any snapshot entry not in current meaningful secrets = dirty (was deleted)
    for (const id of snapshotIds) {
      if (!currentIds.has(id)) return true;
    }

    // Compare fields for each matching ID
    for (const secret of meaningfulSecrets) {
      const snap = snapshot[secret.secretReference.id];
      if (!snap) return true;

      const ref = secret.secretReference as AwsSecretValue["secretReference"];
      if (
        ref.alias !== snap.alias ||
        ref.identifier !== snap.identifier ||
        String(ref.version ?? "") !== snap.version
      ) {
        return true;
      }
    }

    return false;
  }
);

export const selectFetchErrors = createSelector(selectSecretsManagerSlice, (slice) => slice.fetchErrors);

export const selectValidationErrors = createSelector(selectSecretsManagerSlice, (slice) => slice.validationErrors);
