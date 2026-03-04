import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  SecretProviderMetadata,
  SecretProviderType,
  SecretValue,
  AwsSecretValue,
} from "@requestly/shared/types/entities/secretsManager";
import { secretsManagerService, toSecretProviderConfig } from "services/secretsManagerService";
import { ProviderData } from "features/settings/secrets-manager/context/SecretsModalsContext";
import { PendingSecretEntry } from "./types";
import { selectAllSecrets, selectSelectedProviderId, selectAllSecretProviders } from "./selectors";
import { secretsManagerActions } from "./slice";
import { secretVariables } from "lib/secret-variables";

type RootState = { secretsManager: import("./types").SecretsManagerState };

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

export const refreshSecretsForProvider = createAsyncThunk<
  SecretValue[],
  { providerId: string; pendingEntries: PendingSecretEntry[] },
  { rejectValue: string; state: RootState }
>("secretsManager/refreshSecretsForProvider", async ({ providerId, pendingEntries }, { rejectWithValue }) => {
  const allSecrets: SecretValue[] = [];

  const refreshResult = await secretsManagerService.refreshSecrets(providerId);
  if (refreshResult.type === "error") {
    return rejectWithValue(refreshResult.error.message);
  }
  const refreshedSecrets = refreshResult.data.filter((s): s is SecretValue => s !== null);
  allSecrets.push(...refreshedSecrets);

  if (pendingEntries.length > 0) {
    const refs = pendingEntries.map((entry) => ({
      providerId,
      ref: {
        type: SecretProviderType.AWS_SECRETS_MANAGER as const,
        alias: entry.alias,
        identifier: entry.identifier,
        version: entry.version,
      },
    }));

    const pendingResult = await secretsManagerService.getSecretValues(refs);
    if (pendingResult.type === "error") {
      return rejectWithValue(pendingResult.error.message);
    }
    allSecrets.push(...pendingResult.data);
  }

  secretVariables.updateSourceFromSecrets(allSecrets as AwsSecretValue[]);

  return allSecrets;
});

export const getSecretsForProvider = createAsyncThunk<SecretValue[], string, { rejectValue: string; state: RootState }>(
  "secretsManager/getSecretsForProvider",
  async (providerId, { getState, rejectWithValue }) => {
    const state = getState();
    const existingSecrets = selectAllSecrets(state).filter((s) => s.providerId === providerId);

    if (existingSecrets.length === 0) {
      return [];
    }

    const refs = existingSecrets.map((s) => ({
      providerId,
      ref: s.secretReference,
    }));

    const result = await secretsManagerService.getSecretValues(refs);
    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }

    secretVariables.updateSourceFromSecrets(result.data as AwsSecretValue[]);

    return result.data;
  }
);

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
      dispatch(refreshSecretsForProvider({ providerId: activeProviderId, pendingEntries: [] }));
    }
  }
);
