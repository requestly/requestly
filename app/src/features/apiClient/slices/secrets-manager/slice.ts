import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SECRETS_MANAGER_SLICE_NAME } from "../common/constants";
import {
  SecretProviderMetadata,
  SecretProviderType,
  SecretValue,
  AwsSecretValue,
} from "@requestly/shared/types/entities/secretsManager";
import { SecretSnapshot, SecretsManagerState } from "./types";
import { fetchAndSaveSecretsForProvider, listSecrets } from "./thunks";
import { providersAdapter, secretsAdapter } from "./adapters";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";

export { providersAdapter, secretsAdapter } from "./adapters";

const initialState: SecretsManagerState = {
  providers: providersAdapter.getInitialState(),
  secrets: secretsAdapter.getInitialState(),
  selectedProviderId: null,
  fetchStatus: "idle",
  fetchErrors: {},
  validationErrors: {},
  secretsSnapshot: {},
};

function removeSecretsForProvider(state: SecretsManagerState, providerId: string) {
  const allSecrets = secretsAdapter.getSelectors().selectAll(state.secrets);
  const idsToRemove = allSecrets.filter((s) => s.providerId === providerId).map((s) => s.secretReference.id);
  secretsAdapter.removeMany(state.secrets, idsToRemove);
}

function captureSnapshot(state: SecretsManagerState, providerId: string): Record<string, SecretSnapshot> {
  const allSecrets = secretsAdapter.getSelectors().selectAll(state.secrets);
  const providerSecrets = allSecrets.filter((s) => s.providerId === providerId);
  const snapshot: Record<string, SecretSnapshot> = {};
  for (const s of providerSecrets) {
    const ref = s.secretReference as AwsSecretValue["secretReference"];
    snapshot[s.secretReference.id] = {
      alias: s.secretReference.alias,
      identifier: ref.identifier ?? "",
      version: String(ref.version ?? ""),
    };
  }
  return snapshot;
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
      state.secretsSnapshot = {};
    },

    upsertSecrets(state, action: PayloadAction<SecretValue[]>) {
      secretsAdapter.upsertMany(state.secrets, action.payload);
    },
    setSecretsForProvider(state, action: PayloadAction<{ providerId: string; secrets: SecretValue[] }>) {
      const { providerId, secrets } = action.payload;
      removeSecretsForProvider(state, providerId);
      secretsAdapter.upsertMany(state.secrets, secrets);
      state.secretsSnapshot = captureSnapshot(state, providerId);
    },
    removeSecret(state, action: PayloadAction<string>) {
      secretsAdapter.removeOne(state.secrets, action.payload);
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
    },

    addSecretEntryWithId(state, action: PayloadAction<{ providerId: string; secretRefId: string }>) {
      const { providerId, secretRefId } = action.payload;
      const stub: AwsSecretValue = {
        type: SecretProviderType.AWS_SECRETS_MANAGER,
        providerId,
        secretReference: {
          id: secretRefId,
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
    },

    removeSecretEntry(state, action: PayloadAction<{ providerId: string; secretRefId: string }>) {
      secretsAdapter.removeOne(state.secrets, action.payload.secretRefId);
    },

    unsafePatchSecret(state, action: PayloadAction<{ id: string; patcher: (secret: SecretValue) => void }>) {
      const secret = state.secrets.entities[action.payload.id];
      if (secret) {
        action.payload.patcher(secret);
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
        state.secretsSnapshot = captureSnapshot(state, providerId);

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
        state.secretsSnapshot = captureSnapshot(state, providerId);
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
