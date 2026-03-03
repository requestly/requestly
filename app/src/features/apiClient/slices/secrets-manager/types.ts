import { EntityState } from "@reduxjs/toolkit";
import { SecretProviderMetadata, SecretValue } from "@requestly/shared/types/entities/secretsManager";

export interface SecretsManagerState {
  providers: EntityState<SecretProviderMetadata>;
  secrets: EntityState<SecretValue>;
}
