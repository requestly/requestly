import { createAsyncThunk } from "@reduxjs/toolkit";
import { SecretProviderMetadata, SecretValue } from "@requestly/shared/types/entities/secretsManager";
import { secretsManagerService } from "services/secretsManagerService";

export const fetchSecretProviders = createAsyncThunk<SecretProviderMetadata[], void, { rejectValue: string }>(
  "secretsManager/fetchProviders",
  async (_, { rejectWithValue }) => {
    const result = await secretsManagerService.listProviders();

    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }

    return result.data;
  }
);

export const fetchSecretsForProvider = createAsyncThunk<SecretValue[], string, { rejectValue: string }>(
  "secretsManager/fetchSecretsForProvider",
  async (providerId, { rejectWithValue }) => {
    const result = await secretsManagerService.refreshSecrets(providerId);

    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }

    return result.data.filter((s): s is SecretValue => s !== null);
  }
);

let isSubscriptionRegistered = false;
export const initAndSubscribeSecretsManager = createAsyncThunk<void, void, { rejectValue: string }>(
  "secretsManager/init",
  async (_, { dispatch, rejectWithValue, signal }) => {
    const initResult = await secretsManagerService.init();

    if (initResult.type === "error") {
      return rejectWithValue(initResult.error.message);
    }

    if (signal.aborted) {
      return;
    }

    if (!isSubscriptionRegistered) {
      isSubscriptionRegistered = true;
      secretsManagerService.subscribeToProvidersChange(() => {
        dispatch(fetchSecretProviders());
      });
    }

    await dispatch(fetchSecretProviders());
  }
);
