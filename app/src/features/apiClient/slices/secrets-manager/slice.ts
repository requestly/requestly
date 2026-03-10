import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SECRETS_MANAGER_SLICE_NAME } from "../common/constants";
import {
  SecretProviderMetadata,
  SecretProviderType,
  SecretValue,
  AwsSecretValue,
} from "@requestly/shared/types/entities/secretsManager";
import { SecretsManagerState } from "./types";
import { fetchAndSaveSecretsForProvider, listSecrets } from "./thunks";
import { providersAdapter, secretsAdapter } from "./adapters";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";

export { providersAdapter, secretsAdapter } from "./adapters";

const initialState: SecretsManagerState = {
  providers: providersAdapter.getInitialState(),
  secrets: secretsAdapter.getInitialState(),
  isDirty: false,
  selectedProviderId: null,
  fetchStatus: "idle",
  fetchErrors: {},
  validationErrors: {},
  editedSecretIds: new Set(),
};

function removeSecretsForProvider(state: SecretsManagerState, providerId: string) {
  const allSecrets = secretsAdapter.getSelectors().selectAll(state.secrets);
  const idsToRemove = allSecrets.filter((s) => s.providerId === providerId).map((s) => s.secretReference.id);
  secretsAdapter.removeMany(state.secrets, idsToRemove);
}

function hasUnsavedChanges(state: SecretsManagerState, providerId: string): boolean {
  const allSecrets = secretsAdapter.getSelectors().selectAll(state.secrets);
  const providerSecrets = allSecrets.filter((s) => s.providerId === providerId);

  // Check if there are any stub rows (newly added but not fetched)
  const hasStubRows = providerSecrets.some((s) => s.fetchedAt === 0);

  // Check if there are any edited fetched rows for this provider
  const hasEditedRows = providerSecrets.some((s) => state.editedSecretIds.has(s.secretReference.id));

  return hasStubRows || hasEditedRows;
}

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
      state.isDirty = false;
      state.editedSecretIds.clear();
    },

    upsertSecrets(state, action: PayloadAction<SecretValue[]>) {
      secretsAdapter.upsertMany(state.secrets, action.payload);
    },
    setSecretsForProvider(state, action: PayloadAction<{ providerId: string; secrets: SecretValue[] }>) {
      const { providerId, secrets } = action.payload;
      removeSecretsForProvider(state, providerId);
      secretsAdapter.upsertMany(state.secrets, secrets);
      state.isDirty = false;
      state.editedSecretIds.clear();
    },
    removeSecret(state, action: PayloadAction<string>) {
      const secretToRemove = state.secrets.entities[action.payload];
      const providerId = secretToRemove?.providerId;

      secretsAdapter.removeOne(state.secrets, action.payload);
      state.editedSecretIds.delete(action.payload);

      // Recalculate isDirty if we know the provider
      if (providerId) {
        state.isDirty = hasUnsavedChanges(state, providerId);
      }
    },
    removeSecrets(state, action: PayloadAction<string[]>) {
      secretsAdapter.removeMany(state.secrets, action.payload);
    },

    addSecretEntry(state, action: PayloadAction<{ providerId: string }>) {
      const { providerId } = action.payload;
      const stub: AwsSecretValue = {
        type: SecretProviderType.AWS_SECRETS_MANAGER,
        providerId,
        secretReference: {
          id: crypto.randomUUID(),
          type: SecretProviderType.AWS_SECRETS_MANAGER,
          alias: "",
          identifier: "",
        },
        fetchedAt: 0,
        name: "",
        value: "",
        ARN: "",
        versionId: "",
      };
      secretsAdapter.addOne(state.secrets, stub);
      state.isDirty = true;
    },

    removeSecretEntry(state, action: PayloadAction<{ providerId: string; secretRefId: string }>) {
      secretsAdapter.removeOne(state.secrets, action.payload.secretRefId);
      state.editedSecretIds.delete(action.payload.secretRefId);

      // Recalculate isDirty based on whether there are any unsaved changes remaining
      state.isDirty = hasUnsavedChanges(state, action.payload.providerId);
    },

    unsafePatchSecret(state, action: PayloadAction<{ id: string; patcher: (secret: SecretValue) => void }>) {
      const secret = state.secrets.entities[action.payload.id];
      if (secret) {
        action.payload.patcher(secret);

        // Track edited fetched rows (not stub rows)
        if (secret.fetchedAt > 0) {
          state.editedSecretIds.add(action.payload.id);
        }

        state.isDirty = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAndSaveSecretsForProvider.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchAndSaveSecretsForProvider.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const { providerId } = action.meta.arg;
        const { secrets, errors, validationErrors } = action.payload;

        removeSecretsForProvider(state, providerId);
        secretsAdapter.upsertMany(state.secrets, secrets);
        state.isDirty = false;
        state.editedSecretIds.clear();

        const errorMap: Record<string, string> = {};
        for (const err of errors) {
          errorMap[err.secretRefId] = err.message;
        }
        state.fetchErrors = errorMap;
        state.validationErrors = validationErrors;
      })
      .addCase(fetchAndSaveSecretsForProvider.rejected, (state) => {
        state.fetchStatus = "failed";
      })
      .addCase(listSecrets.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(listSecrets.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const providerId = action.meta.arg;

        removeSecretsForProvider(state, providerId);
        secretsAdapter.upsertMany(state.secrets, action.payload);
        state.isDirty = false;
        state.editedSecretIds.clear();
      })
      .addCase(listSecrets.rejected, (state) => {
        state.fetchStatus = "failed";
      });
  },
});

export const secretsManagerActions = secretsManagerSlice.actions;
export const secretsManagerReducer = secretsManagerSlice.reducer;

const secretsManagerPersistConfig = {
  key: "secrets_manager",
  storage,
  whitelist: ["selectedProviderId"],
};

export const secretsManagerReducerWithPersist = persistReducer(
  secretsManagerPersistConfig,
  secretsManagerSlice.reducer
);
