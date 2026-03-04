import { createAsyncThunk } from "@reduxjs/toolkit";
import { SecretProviderMetadata } from "@requestly/shared/types/entities/secretsManager";
import { secretsManagerService } from "services/secretsManagerService";
import { secretsManagerActions } from "./slice";

export const fetchSecretProviders = createAsyncThunk<SecretProviderMetadata[], void, { rejectValue: string }>(
  "secretsManager/fetchProviders",
  async (_, { dispatch, rejectWithValue }) => {
    const result = await secretsManagerService.listProviders();

    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }

    const providers = result.data;
    console.log("!!!debug", "providers", providers);
    dispatch(secretsManagerActions.setAllProviders(providers));
    return providers;
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
      secretsManagerService.subscribeToProvidersChange((providers) => {
        dispatch(secretsManagerActions.setAllProviders(providers));
      });
    }

    await dispatch(fetchSecretProviders()).unwrap();
  }
);
