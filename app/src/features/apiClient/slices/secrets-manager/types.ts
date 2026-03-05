import { EntityState } from "@reduxjs/toolkit";
import { SecretProviderMetadata, SecretValue } from "@requestly/shared/types/entities/secretsManager";

export type FetchStatus = "idle" | "loading" | "succeeded" | "failed";

export interface SecretsManagerState {
  providers: EntityState<SecretProviderMetadata>;
  secrets: EntityState<SecretValue>;
  isDirty: Record<string, boolean>;
  selectedProviderId: string | null;
  fetchStatus: FetchStatus;
}
