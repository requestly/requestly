import { createEntityAdapter } from "@reduxjs/toolkit";
import { SecretProviderMetadata, SecretValue } from "@requestly/shared/types/entities/secretsManager";

export const providersAdapter = createEntityAdapter<SecretProviderMetadata>({
  selectId: (provider) => provider.id,
});

export const secretsAdapter = createEntityAdapter<SecretValue>({
  selectId: (value) => value.secretReference.id,
});
