import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { SECRETS_MANAGER_SLICE_NAME } from "../common/constants";
import {
  SecretProviderMetadata,
  SecretProviderType,
  SecretValue,
  AwsSecretValue,
} from "@requestly/shared/types/entities/secretsManager";
import { SecretsManagerState } from "./types";
import { fetchSecretProviders, fetchSecretsForProvider } from "./thunks";

export const providersAdapter = createEntityAdapter<SecretProviderMetadata>({
  selectId: (provider) => provider.id,
});

export const secretsAdapter = createEntityAdapter<SecretValue>({
  selectId: (value) => getSecretId(value),
});

export function getSecretId(secret: SecretValue): string {
  return `name:${secret.secretReference.identifier};version:${secret.secretReference.version ?? "latest"}`;
}

// TODO: Remove sample data once real provider/secret flows are fully wired
const SAMPLE_PROVIDER_ID = "sample-provider-staging";

const SAMPLE_PROVIDER: SecretProviderMetadata = {
  id: SAMPLE_PROVIDER_ID,
  type: SecretProviderType.AWS_SECRETS_MANAGER,
  name: "Staging",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const SAMPLE_SECRETS: AwsSecretValue[] = [
  {
    type: SecretProviderType.AWS_SECRETS_MANAGER,
    providerId: SAMPLE_PROVIDER_ID,
    secretReference: {
      type: SecretProviderType.AWS_SECRETS_MANAGER,
      identifier: "mysecret-a1b2",
      version: "3sf3re-8er5-4er6-wer7-wereryy38",
    },
    fetchedAt: Date.now(),
    name: "DB_PASSWORD",
    value: "sk_test_supersecretpassword",
    ARN: "arn:aws:secretsmanager:us-west-2:123456789012:secret:mysecret-a1b2",
    versionId: "3sf3re-8er5-4er6-wer7-wereryy38",
  },
  {
    type: SecretProviderType.AWS_SECRETS_MANAGER,
    providerId: SAMPLE_PROVIDER_ID,
    secretReference: {
      type: SecretProviderType.AWS_SECRETS_MANAGER,
      identifier: "stripe-keys",
    },
    fetchedAt: Date.now(),
    name: "STRIPE_API_KEY",
    value: '{"api_key":"sk_live_1234567890abcdef","web_sec":"whsec_abcdefghijklmnop"}',
    ARN: "arn:aws:secretsmanager:us-east-1:123456789:secret:stripe-keys",
    versionId: "",
  },
];
// END TODO: Remove sample data

// TODO: Remove sample data seeding
const seededProviders = providersAdapter.setAll(providersAdapter.getInitialState(), [SAMPLE_PROVIDER]);
const seededSecrets = secretsAdapter.setAll(secretsAdapter.getInitialState(), SAMPLE_SECRETS);

const initialState: SecretsManagerState = {
  providers: seededProviders,
  secrets: seededSecrets,
  selectedProviderId: SAMPLE_PROVIDER_ID,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecretProviders.fulfilled, (state, action) => {
        providersAdapter.setAll(state.providers, action.payload);
      })
      .addCase(fetchSecretsForProvider.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchSecretsForProvider.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        secretsAdapter.upsertMany(state.secrets, action.payload);
      })
      .addCase(fetchSecretsForProvider.rejected, (state) => {
        state.fetchStatus = "failed";
      });
  },
});

export const secretsManagerActions = secretsManagerSlice.actions;
export const secretsManagerReducer = secretsManagerSlice.reducer;
