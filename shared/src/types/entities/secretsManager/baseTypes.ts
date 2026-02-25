export enum SecretProviderType {
  AWS_SECRETS_MANAGER = "aws",
  HASHICORP_VAULT = "hashicorp_vault",
}

/**
 * Generic provider configuration wrapper that adds metadata to credentials.
 *
 * @template T - The provider type
 * @template C - The provider-specific credentials type
 */
export interface ProviderConfig<T extends SecretProviderType, C> {
  id: string;
  type: T;
  name: string;
  createdAt: number;
  updatedAt: number;
  credentials: C;
}

/**
 * Base secret reference interface.
 * Provider-specific implementations extend this with additional fields.
 *
 * @template T - The provider type
 */
export interface SecretReference<T extends SecretProviderType> {
  type: T;
}
