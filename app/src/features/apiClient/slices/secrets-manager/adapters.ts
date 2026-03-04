import { createEntityAdapter } from "@reduxjs/toolkit";
import { SecretProviderMetadata, SecretValue } from "@requestly/shared/types/entities/secretsManager";

export function getSecretId(secret: SecretValue): string {
  return `name:${secret.secretReference.identifier};version:${secret.secretReference.version ?? "latest"}`;
}

export const providersAdapter = createEntityAdapter<SecretProviderMetadata>({
  selectId: (provider) => provider.id,
});

export const secretsAdapter = createEntityAdapter<SecretValue>({
  selectId: (value) => getSecretId(value),
});
