import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  SecretProviderMetadata,
  SecretValue,
  AwsSecretValue,
  SecretReference,
} from "@requestly/shared/types/entities/secretsManager";
import { notification } from "antd";
import { secretsManagerService, toSecretProviderConfig, SecretFetchError } from "services/secretsManagerService";
import { ProviderData } from "features/settings/secrets-manager/context/SecretsModalsContext";
import {
  selectAllSecrets,
  selectSelectedProviderId,
  selectAllSecretProviders,
  selectSecretsByProviderId,
} from "./selectors";
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

    if (result.data.length > 0) {
      dispatch(secretsManagerActions.setAllProviders(result.data));
    } else {
      dispatch(secretsManagerActions.setAllProviders([]));
      dispatch(secretsManagerActions.setSelectedProviderId(null));
    }

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
  {
    secrets: SecretValue[];
    errors: SecretFetchError[];
    validationErrors: Record<string, { alias?: string; identifier?: string }>;
  },
  { providerId: string },
  { rejectValue: string; state: RootState }
>("secretsManager/fetchAndSaveSecretsForProvider", async ({ providerId }, { getState, rejectWithValue }) => {
  const state = getState();
  const allProviderSecrets = selectSecretsByProviderId(state)(providerId);
  const secretRefs = allProviderSecrets.map((s) => s.secretReference);

  // Frontend validation — runs before the IPC call
  const aliasCounts = new Map<string, number>();
  for (const s of allProviderSecrets) {
    const alias = (s.secretReference.alias ?? "").trim();
    if (alias) {
      aliasCounts.set(alias, (aliasCounts.get(alias) ?? 0) + 1);
    }
  }

  const validationMap: Record<string, { alias?: string; identifier?: string }> = {};
  for (const s of allProviderSecrets) {
    const refId = s.secretReference.id;
    const alias = (s.secretReference.alias ?? "").trim();
    const identifier = ((s as AwsSecretValue).secretReference.identifier ?? "").trim();

    if (!alias) {
      validationMap[refId] = { ...validationMap[refId], alias: "Alias is required" };
    } else if ((aliasCounts.get(alias) ?? 0) > 1) {
      validationMap[refId] = { ...validationMap[refId], alias: `Alias "${alias}" is duplicated` };
    }

    if (!identifier) {
      validationMap[refId] = { ...validationMap[refId], identifier: "ARN/Secret name is required" };
    }
  }

  const invalidRefIds = new Set(Object.keys(validationMap));
  const validRefs = secretRefs.filter((ref) => !invalidRefIds.has(ref.id));

  const fetchAndSaveSecretsResult = await secretsManagerService.fetchAndSaveSecrets(providerId, validRefs);
  if (fetchAndSaveSecretsResult.type === "error") {
    return rejectWithValue(fetchAndSaveSecretsResult.error.message);
  }

  const { secrets, errors: backendErrors } = fetchAndSaveSecretsResult.data;

  const totalErrorCount = Object.keys(validationMap).length + backendErrors.length;
  if (totalErrorCount > 0) {
    const firstBackendError = backendErrors[0];
    const firstValidationEntry = Object.entries(validationMap)[0];
    const singleErrorMessage =
      totalErrorCount === 1
        ? firstBackendError?.message ?? firstValidationEntry?.[1]?.alias ?? firstValidationEntry?.[1]?.identifier
        : undefined;

    notification.warn({
      message: "Some secrets failed to fetch",
      description:
        singleErrorMessage ?? `${totalErrorCount} secrets failed to fetch. Hover the error icon for details.`,
      placement: "bottomRight",
      className: "add-secrets-provider-notification",
    });
  }

  const erroredRefIds = new Set([...Object.keys(validationMap), ...backendErrors.map((e) => e.secretRefId)]);
  const originalErroredRows = allProviderSecrets.filter((s) => erroredRefIds.has(s.secretReference.id));
  const allSecretsForRedux = [...secrets, ...originalErroredRows];

  secretVariables.updateSourceFromSecrets(secrets as AwsSecretValue[]);
  return { secrets: allSecretsForRedux, errors: backendErrors, validationErrors: validationMap };
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

    dispatch(deleteAllSecretsForProvider({ providerId }));

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

export const deleteAllSecretsForProvider = createAsyncThunk<
  void,
  { providerId: string },
  { rejectValue: string; state: RootState }
>("secretsManager/deleteAllSecretsForProvider", async ({ providerId }, { dispatch, rejectWithValue, getState }) => {
  const state = getState();
  const allSecrets = selectSecretsByProviderId(state)(providerId);

  const secretsToDelete = allSecrets.filter((s) => s.providerId === providerId);

  const secretRefsToDelete = secretsToDelete.map((s) => s.secretReference);
  const result = await secretsManagerService.removeSecretValues(secretRefsToDelete.map((ref) => ({ providerId, ref })));
  if (result.type === "error") {
    return rejectWithValue(result.error.message);
  }
  dispatch(secretsManagerActions.removeSecrets(secretRefsToDelete.map((s) => s.id)));

  const secrets = selectAllSecrets(state);
  secretVariables.updateSourceFromSecrets(secrets.filter((s) => s.providerId !== providerId) as AwsSecretValue[]);
});

export const revertDirtyChanges = createAsyncThunk(
  `secretsManager/revertDirtyChanges`,
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const providerId = selectSelectedProviderId(state);
    if (providerId) {
      await dispatch(listSecrets(providerId));
    }
  }
);
