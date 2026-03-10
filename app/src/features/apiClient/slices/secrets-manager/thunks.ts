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
import { selectSelectedProviderId, selectAllSecretProviders, selectSecretsByProviderId } from "./selectors";
import { secretsManagerActions } from "./slice";
import { secretVariables } from "lib/secret-variables";
import { SECRETS_MANAGER_SLICE_NAME } from "../common/constants";
import { toast } from "utils/Toast";

type RootState = { secretsManager: import("./types").SecretsManagerState };

export const fetchSecretProviders = createAsyncThunk<
  SecretProviderMetadata[],
  void,
  { rejectValue: string; state: RootState }
>(`${SECRETS_MANAGER_SLICE_NAME}/fetchProviders`, async (_, { rejectWithValue, dispatch, getState }) => {
  const result = await secretsManagerService.listProviders();

  if (result.type === "error") {
    return rejectWithValue(result.error.message);
  }

  if (result.data.length > 0) {
    dispatch(secretsManagerActions.setAllProviders(result.data));
    const state = getState();
    const activeProviderId = selectSelectedProviderId(state);

    if (!activeProviderId || !result.data.some((p) => p.id === activeProviderId)) {
      const firstProvider = result.data[0]!;
      dispatch(secretsManagerActions.setSelectedProviderId(firstProvider.id));
      await dispatch(listSecrets(firstProvider.id)).unwrap();
    }
  } else {
    dispatch(secretsManagerActions.setAllProviders([]));
    dispatch(secretsManagerActions.setSelectedProviderId(null));
    secretVariables.updateSourceFromSecrets([]);
  }

  return result.data;
});

export const listSecrets = createAsyncThunk<SecretValue[], string, { rejectValue: string; state: RootState }>(
  `${SECRETS_MANAGER_SLICE_NAME}/listSecrets`,
  async (providerId, { rejectWithValue }) => {
    const result = await secretsManagerService.listSecrets(providerId);
    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }

    // Redux state updation is done in the extraReducers of the slice

    secretVariables.updateSourceFromSecrets(result.data as AwsSecretValue[]);
    toast.success("Successfully fetched secrets");
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
>(
  `${SECRETS_MANAGER_SLICE_NAME}/fetchAndSaveSecretsForProvider`,
  async ({ providerId }, { getState, rejectWithValue }) => {
    const state = getState();
    const allProviderSecrets = selectSecretsByProviderId(state)(providerId);

    // Rows where both alias and identifier are empty are silently ignored
    const nonBlankSecrets = allProviderSecrets.filter((s) => {
      const alias = (s.secretReference.alias ?? "").trim();
      const identifier = ((s as AwsSecretValue).secretReference.identifier ?? "").trim();
      return alias !== "" || identifier !== "";
    });

    const secretRefs = nonBlankSecrets.map((s) => s.secretReference);

    // Frontend validation — runs before the IPC call
    const aliasCounts = new Map<string, number>();
    for (const s of nonBlankSecrets) {
      const alias = (s.secretReference.alias ?? "").trim();
      if (alias) {
        aliasCounts.set(alias, (aliasCounts.get(alias) ?? 0) + 1);
      }
    }

    const validationMap: Record<string, { alias?: string; identifier?: string }> = {};
    for (const s of nonBlankSecrets) {
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
        description: singleErrorMessage ?? `${totalErrorCount} secrets failed to fetch.`,
        placement: "bottomRight",
        className: "add-secrets-provider-notification",
      });
    } else {
      toast.success("Successfully fetched secrets");
    }

    const erroredRefIds = new Set([...Object.keys(validationMap), ...backendErrors.map((e) => e.secretRefId)]);
    const originalErroredRows = nonBlankSecrets.filter((s) => erroredRefIds.has(s.secretReference.id));
    const allSecretsForRedux = [...secrets, ...originalErroredRows];

    secretVariables.updateSourceFromSecrets(secrets as AwsSecretValue[]);
    return { secrets: allSecretsForRedux, errors: backendErrors, validationErrors: validationMap };
  }
);

export const saveProvider = createAsyncThunk<
  string,
  { formData: ProviderData; existingId?: string; mode: "add" | "edit" },
  { rejectValue: string; state: RootState }
>(`${SECRETS_MANAGER_SLICE_NAME}/saveProvider`, async ({ formData, existingId }, { dispatch, rejectWithValue }) => {
  const config = toSecretProviderConfig(formData, existingId);

  const result = await secretsManagerService.setProviderConfig(config);
  if (result.type === "error") {
    return rejectWithValue(result.error.message);
  }

  await dispatch(fetchSecretProviders()).unwrap();
  dispatch(secretsManagerActions.setSelectedProviderId(config.id));

  return config.id;
});

let isSubscriptionRegistered = false;
export const initAndSubscribeSecretsManager = createAsyncThunk<void, string, { rejectValue: string; state: RootState }>(
  `${SECRETS_MANAGER_SLICE_NAME}/init`,
  async (userId, { dispatch, getState, rejectWithValue, signal }) => {
    isSubscriptionRegistered = false;
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

    await dispatch(fetchSecretProviders()).unwrap();

    if (signal.aborted) {
      return;
    }

    const state = getState();
    const activeProviderId = selectSelectedProviderId(state);

    if (activeProviderId) {
      await dispatch(listSecrets(activeProviderId)).unwrap();
    }
  }
);

export const deleteProvider = createAsyncThunk<void, string, { rejectValue: string; state: RootState }>(
  `${SECRETS_MANAGER_SLICE_NAME}/deleteProvider`,
  async (providerId, { dispatch, rejectWithValue, getState }) => {
    const result = await secretsManagerService.removeProviderConfig(providerId);
    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }
    dispatch(secretsManagerActions.removeProvider(providerId));
    const state = getState();
    const providers = selectAllSecretProviders(state);
    const nextProvider = providers.find((p) => p.id !== providerId);

    dispatch(deleteAllSecretsForProvider({ providerId })).unwrap();

    if (nextProvider) {
      notification.info({
        message: `"${nextProvider.name}" is now active`,
        description: "Fetch secrets to continue using them in requests",
        placement: "bottomRight",
      });
      dispatch(secretsManagerActions.setSelectedProviderId(nextProvider.id));
      await dispatch(listSecrets(nextProvider.id)).unwrap();
    } else {
      dispatch(secretsManagerActions.setSelectedProviderId(null));
    }
  }
);

export const deleteSecret = createAsyncThunk<
  void,
  { providerId: string; secretReference: SecretReference },
  { rejectValue: string; state: RootState }
>(
  `${SECRETS_MANAGER_SLICE_NAME}/deleteSecret`,
  async ({ providerId, secretReference }, { dispatch, rejectWithValue, getState }) => {
    const result = await secretsManagerService.removeSecretValue(providerId, secretReference);
    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }
    toast.success("Secret deleted");
    dispatch(secretsManagerActions.removeSecret(secretReference.id));

    const state = getState();
    const secretsForProvider = selectSecretsByProviderId(state)(providerId);
    if (secretsForProvider.length === 0) {
      secretVariables.updateSourceFromSecrets([]);
    } else {
      secretVariables.updateSourceFromSecrets(secretsForProvider as AwsSecretValue[]);
    }
  }
);

export const deleteAllSecretsForProvider = createAsyncThunk<
  void,
  { providerId: string },
  { rejectValue: string; state: RootState }
>(
  `${SECRETS_MANAGER_SLICE_NAME}/deleteAllSecretsForProvider`,
  async ({ providerId }, { dispatch, rejectWithValue, getState }) => {
    const state = getState();
    const allSecrets = selectSecretsByProviderId(state)(providerId);

    const secretsToDelete = allSecrets.filter((s) => s.providerId === providerId);

    const secretRefsToDelete = secretsToDelete.map((s) => s.secretReference);
    const result = await secretsManagerService.removeSecretValues(
      secretRefsToDelete.map((ref) => ({ providerId, ref }))
    );
    if (result.type === "error") {
      return rejectWithValue(result.error.message);
    }
    dispatch(secretsManagerActions.removeSecrets(secretRefsToDelete.map((s) => s.id)));

    secretVariables.updateSourceFromSecrets([]);
  }
);

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
