import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { SECRETS_MANAGER_SLICE_NAME } from "../common/constants";
import { SecretProviderMetadata, SecretValue } from "@requestly/shared/types/entities/secretsManager";
import { SecretsManagerState } from "./types";

export const providersAdapter = createEntityAdapter<SecretProviderMetadata>({
  selectId: (provider) => provider.id,
});

export const secretsAdapter = createEntityAdapter<SecretValue>({
  selectId: (value) => `name:${value.secretReference.identifier};version:${value.secretReference.version ?? "latest"}`,
});

const initialState: SecretsManagerState = {
  providers: providersAdapter.getInitialState(),
  secrets: secretsAdapter.getInitialState(),
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

    upsertSecrets(state, action: PayloadAction<SecretValue[]>) {
      secretsAdapter.upsertMany(state.secrets, action.payload);
    },
    removeSecret(state, action: PayloadAction<string>) {
      secretsAdapter.removeOne(state.secrets, action.payload);
    },
    removeSecrets(state, action: PayloadAction<string[]>) {
      secretsAdapter.removeMany(state.secrets, action.payload);
    },
  },
});

export const secretsManagerActions = secretsManagerSlice.actions;
export const secretsManagerReducer = secretsManagerSlice.reducer;

export const secretsManagerSelectors = {
  selectAllProviders: (state: { secretsManager: SecretsManagerState }) =>
    providersAdapter.getSelectors().selectAll(state.secretsManager.providers),
  selectProviderById: (state: { secretsManager: SecretsManagerState }, id: string) =>
    providersAdapter.getSelectors().selectById(state.secretsManager.providers, id),

  selectAllSecrets: (state: { secretsManager: SecretsManagerState }) =>
    secretsAdapter.getSelectors().selectAll(state.secretsManager.secrets),
  selectSecretById: (state: { secretsManager: SecretsManagerState }, id: string) =>
    secretsAdapter.getSelectors().selectById(state.secretsManager.secrets, id),
};
