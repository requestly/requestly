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
    dispatch(secretsManagerActions.setAllProviders(providers));
    return providers;
  }
);

export const initAndSubscribeSecretsManager = createAsyncThunk<void, void, { rejectValue: string }>(
  "secretsManager/init",
  async (_, { dispatch, rejectWithValue }) => {
    const initResult = await secretsManagerService.init();

    if (initResult.type === "error") {
      return rejectWithValue(initResult.error.message);
    }

    secretsManagerService.subscribeToProvidersChange((providers) => {
      dispatch(secretsManagerActions.setAllProviders(providers));
    });

    await dispatch(fetchSecretProviders()).unwrap();
  }
);
