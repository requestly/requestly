import { SecretProviderType, ProviderConfig, SecretReference } from "./baseTypes";

export interface HashicorpVaultCredentials {
  address: string;
  token?: string;
  namespace?: string;
  apiVersion?: string;
}

export type HashicorpVaultProviderConfig = ProviderConfig<
  SecretProviderType.HASHICORP_VAULT,
  HashicorpVaultCredentials
>;

export interface VaultSecretReference extends SecretReference<SecretProviderType.HASHICORP_VAULT> {
  path: string;
  version?: number;
}

export interface VaultSecretValue {
  type: SecretProviderType.HASHICORP_VAULT;
  providerId: string;
  secretReference: VaultSecretReference;
  fetchedAt: number;
  path: string;
  data: Record<string, any>;
  metadata?: {
    version: number;
    created_time: string;
    deletion_time?: string;
    destroyed?: boolean;
  };
}
