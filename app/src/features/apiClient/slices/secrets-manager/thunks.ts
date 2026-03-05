import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  SecretProviderMetadata,
  SecretValue,
  AwsSecretValue,
  SecretReference,
} from "@requestly/shared/types/entities/secretsManager";
import { secretsManagerService, toSecretProviderConfig } from "services/secretsManagerService";
import { ProviderData } from "features/settings/secrets-manager/context/SecretsModalsContext";
import { selectAllSecrets, selectSelectedProviderId, selectAllSecretProviders } from "./selectors";
import { secretsManagerActions } from "./slice";
import { secretVariables } from "lib/secret-variables";

type RootState = { secretsManager: import("./types").SecretsManagerState };

export const fetchSecretProviders = createAsyncThunk<SecretProviderMetadata[], void, { rejectValue: string }>(
  "secretsManager/fetchProviders",
  async (_, { rejectWithValue, dispatch }) => {
    const result = await secretsManagerService.listProviders();

    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }

    dispatch(secretsManagerActions.setAllProviders(result.data));

    return result.data;
  }
);

export const listSecrets = createAsyncThunk<SecretValue[], string, { rejectValue: string; state: RootState }>(
  "secretsManager/listSecrets",
  async (providerId, { rejectWithValue }) => {
    const result = await secretsManagerService.listSecrets(providerId);
    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }

    // Redux state updation is done in the extraReducers of the slice

    secretVariables.updateSourceFromSecrets(result.data as AwsSecretValue[]);
    return result.data;
  }
);

export const fetchAndSaveSecretsForProvider = createAsyncThunk<
  SecretValue[],
  { providerId: string },
  { rejectValue: string; state: RootState }
>("secretsManager/fetchAndSaveSecretsForProvider", async ({ providerId }, { getState, rejectWithValue }) => {
  const state = getState();
  const allSecrets = selectAllSecrets(state).filter((s) => s.providerId === providerId);
  const secretRefs = allSecrets.map((s) => s.secretReference);

  const fetchAndSaveSecretsResult = await secretsManagerService.fetchAndSaveSecrets(providerId, secretRefs);
  if (fetchAndSaveSecretsResult.type === "error") {
    return rejectWithValue(fetchAndSaveSecretsResult.error.message);
  }

  const fetchedSecrets = fetchAndSaveSecretsResult.data.filter((s): s is SecretValue => s !== null);

  // Redux state updation is done in the extraReducers of the slice

  secretVariables.updateSourceFromSecrets(fetchedSecrets as AwsSecretValue[]);
  return fetchedSecrets;
});

export const saveProvider = createAsyncThunk<
  string,
  { formData: ProviderData; existingId?: string; mode: "add" | "edit" },
  { rejectValue: string; state: RootState }
>("secretsManager/saveProvider", async ({ formData, existingId }, { dispatch, rejectWithValue }) => {
  const config = toSecretProviderConfig(formData, existingId);

  const result = await secretsManagerService.setProviderConfig(config);
  if (result.type === "error") {
    return rejectWithValue(result.error.message);
  }

  await dispatch(fetchSecretProviders());
  dispatch(secretsManagerActions.setSelectedProviderId(config.id));

  return config.id;
});

let isSubscriptionRegistered = false;
export const initAndSubscribeSecretsManager = createAsyncThunk<void, string, { rejectValue: string; state: RootState }>(
  "secretsManager/init",
  async (userId, { dispatch, getState, rejectWithValue, signal }) => {
    console.log("!!!debug", "initAndSubscribeSecretsManager", userId);
    const initResult = await secretsManagerService.init(userId);

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

    if (signal.aborted) {
      return;
    }

    const state = getState();
    let activeProviderId = selectSelectedProviderId(state);

    if (!activeProviderId) {
      const providers = selectAllSecretProviders(state);
      const firstProvider = providers[0];
      if (firstProvider) {
        activeProviderId = firstProvider.id;
        dispatch(secretsManagerActions.setSelectedProviderId(activeProviderId));
      }
    }

    if (activeProviderId) {
      console.log("!!!debug", "initAndSubscribeSecretsManager", "listSecrets", activeProviderId);
      await dispatch(listSecrets(activeProviderId));
    }
  }
);

export const deleteProvider = createAsyncThunk<void, string, { rejectValue: string; state: RootState }>(
  "secretsManager/deleteProvider",
  async (providerId, { dispatch, rejectWithValue, getState }) => {
    const result = await secretsManagerService.removeProviderConfig(providerId);
    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }
    dispatch(secretsManagerActions.removeProvider(providerId));
    const state = getState();
    const providers = selectAllSecretProviders(state);
    const nextProvider = providers.find((p) => p.id !== providerId);
    if (nextProvider) {
      dispatch(secretsManagerActions.setSelectedProviderId(nextProvider.id));
    } else {
      dispatch(secretsManagerActions.setSelectedProviderId(null));
    }
  }
);

export const deleteSecret = createAsyncThunk<
  void,
  { providerId: string; secretReference: SecretReference },
  { rejectValue: string; state: RootState }
>("secretsManager/deleteSecret", async ({ providerId, secretReference }, { dispatch, rejectWithValue }) => {
  const result = await secretsManagerService.removeSecretValue(providerId, secretReference);
  if (result.type === "error") {
    return rejectWithValue(result.error.message);
  }

  dispatch(secretsManagerActions.removeSecret(secretReference.id));
});
