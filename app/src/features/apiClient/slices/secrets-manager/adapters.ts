import { createEntityAdapter } from "@reduxjs/toolkit";
import { SecretProviderMetadata, SecretReference, SecretValue } from "@requestly/shared/types/entities/secretsManager";

export function getSecretId(secretReference: SecretReference): string {
  return `name:${secretReference.identifier};version:${secretReference.version ?? "latest"}`;
}

export const providersAdapter = createEntityAdapter<SecretProviderMetadata>({
  selectId: (provider) => provider.id,
});

export const secretsAdapter = createEntityAdapter<SecretValue>({
  selectId: (value) => getSecretId(value.secretReference),
});
