import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SECRETS_MANAGER_SLICE_NAME } from "../common/constants";
import { SecretProviderMetadata, SecretValue } from "@requestly/shared/types/entities/secretsManager";
import { SecretsManagerState, PendingSecretEntry } from "./types";
import { fetchSecretProviders, refreshSecretsForProvider, getSecretsForProvider } from "./thunks";
import { providersAdapter, secretsAdapter, getSecretId } from "./adapters";

export { providersAdapter, secretsAdapter, getSecretId } from "./adapters";

const initialState: SecretsManagerState = {
  providers: providersAdapter.getInitialState(),
  secrets: secretsAdapter.getInitialState(),
  pendingEntries: {},
  selectedProviderId: null,
  fetchStatus: "idle",
};

export const secretsManagerSlice = createSlice({
  name: SECRETS_MANAGER_SLICE_NAME,
  initialState,
  reducers: {
    setAllProviders(state, action: PayloadAction<SecretProviderMetadata[]>) {
      providersAdapter.setAll(state.providers, action.payload);
    },
    upsertProvider(state, action: PayloadAction<SecretProviderMetadata>) {
      providersAdapter.upsertOne(state.providers, action.payload);
    },
    removeProvider(state, action: PayloadAction<string>) {
      providersAdapter.removeOne(state.providers, action.payload);
    },
    unsafePatchProvider(
      state,
      action: PayloadAction<{ id: string; patcher: (provider: SecretProviderMetadata) => void }>
    ) {
      const provider = state.providers.entities[action.payload.id];
      if (provider) {
        action.payload.patcher(provider);
      }
    },

    setSelectedProviderId(state, action: PayloadAction<string | null>) {
      state.selectedProviderId = action.payload;
    },

    upsertSecrets(state, action: PayloadAction<SecretValue[]>) {
      secretsAdapter.upsertMany(state.secrets, action.payload);
    },
    setSecretsForProvider(state, action: PayloadAction<{ providerId: string; secrets: SecretValue[] }>) {
      const { providerId, secrets } = action.payload;
      const allSecrets = secretsAdapter.getSelectors().selectAll(state.secrets);
      const idsToRemove = allSecrets
        .filter((s) => s.providerId === providerId)
        .map((s) => getSecretId(s.secretReference));
      secretsAdapter.removeMany(state.secrets, idsToRemove);
      secretsAdapter.upsertMany(state.secrets, secrets);
    },
    removeSecret(state, action: PayloadAction<string>) {
      secretsAdapter.removeOne(state.secrets, action.payload);
    },
    removeSecrets(state, action: PayloadAction<string[]>) {
      secretsAdapter.removeMany(state.secrets, action.payload);
    },
    unsafePatchSecret(state, action: PayloadAction<{ id: string; patcher: (secret: SecretValue) => void }>) {
      const secret = state.secrets.entities[action.payload.id];
      if (secret) {
        action.payload.patcher(secret);
      }
    },

    addPendingEntry(state, action: PayloadAction<{ providerId: string; entry: PendingSecretEntry }>) {
      const { providerId, entry } = action.payload;
      if (!state.pendingEntries[providerId]) {
        state.pendingEntries[providerId] = [];
      }
      state.pendingEntries[providerId].push(entry);
    },
    updatePendingEntry(
      state,
      action: PayloadAction<{ providerId: string; index: number; entry: Partial<PendingSecretEntry> }>
    ) {
      const { providerId, index, entry } = action.payload;
      const entries = state.pendingEntries[providerId];
      if (entries && entries[index]) {
        Object.assign(entries[index], entry);
      }
    },
    removePendingEntry(state, action: PayloadAction<{ providerId: string; index: number }>) {
      const { providerId, index } = action.payload;
      const entries = state.pendingEntries[providerId];
      if (entries) {
        entries.splice(index, 1);
        if (entries.length === 0) {
          delete state.pendingEntries[providerId];
        }
      }
    },
    clearPendingEntries(state, action: PayloadAction<{ providerId: string }>) {
      delete state.pendingEntries[action.payload.providerId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecretProviders.fulfilled, (state, action) => {
        providersAdapter.setAll(state.providers, action.payload);
      })
      .addCase(refreshSecretsForProvider.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(refreshSecretsForProvider.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const providerId = action.meta.arg.providerId;
        const allSecrets = secretsAdapter.getSelectors().selectAll(state.secrets);
        const idsToRemove = allSecrets
          .filter((s) => s.providerId === providerId)
          .map((s) => getSecretId(s.secretReference));
        secretsAdapter.removeMany(state.secrets, idsToRemove);
        secretsAdapter.upsertMany(state.secrets, action.payload);
        delete state.pendingEntries[providerId];
      })
      .addCase(refreshSecretsForProvider.rejected, (state) => {
        state.fetchStatus = "failed";
      })
      .addCase(getSecretsForProvider.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(getSecretsForProvider.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const providerId = action.meta.arg;
        const allSecrets = secretsAdapter.getSelectors().selectAll(state.secrets);
        const idsToRemove = allSecrets
          .filter((s) => s.providerId === providerId)
          .map((s) => getSecretId(s.secretReference));
        secretsAdapter.removeMany(state.secrets, idsToRemove);
        secretsAdapter.upsertMany(state.secrets, action.payload);
      })
      .addCase(getSecretsForProvider.rejected, (state) => {
        state.fetchStatus = "failed";
      });
  },
});

export const secretsManagerActions = secretsManagerSlice.actions;
export const secretsManagerReducer = secretsManagerSlice.reducer;
