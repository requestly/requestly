import { SecretProviderType } from "./baseTypes";
import type {
  AWSSecretsManagerCredentials,
  AWSSecretProviderConfig,
  AwsSecretReference,
  AwsSecretValue,
} from "./awsProvider";

import type {
  HashicorpVaultCredentials,
  HashicorpVaultProviderConfig,
  VaultSecretReference,
  VaultSecretValue,
} from "./hashicorpProvider";

export { SecretProviderType, ProviderConfig, SecretReference as BaseSecretReference } from "./baseTypes";

export type ProviderCredentials = AWSSecretsManagerCredentials | HashicorpVaultCredentials;

export type SecretProviderConfig = AWSSecretProviderConfig | HashicorpVaultProviderConfig;

export type SecretProviderMetadata = Omit<SecretProviderConfig, "credentials">;

export type SecretReference = AwsSecretReference | VaultSecretReference;

export type SecretValue = AwsSecretValue | VaultSecretValue;

export type {
  AWSSecretsManagerCredentials,
  AWSSecretProviderConfig,
  AwsSecretReference,
  AwsSecretValue,
  HashicorpVaultCredentials,
  HashicorpVaultProviderConfig,
  VaultSecretReference,
  VaultSecretValue,
};

/**
 * Type map for compile-time type lookup.
 * Enables AbstractSecretProvider to infer correct types automatically.
 */
export interface ProviderTypeMap {
  [SecretProviderType.AWS_SECRETS_MANAGER]: {
    credentials: AWSSecretsManagerCredentials;
    providerConfig: AWSSecretProviderConfig;
    reference: AwsSecretReference;
    value: AwsSecretValue;
  };
  [SecretProviderType.HASHICORP_VAULT]: {
    credentials: HashicorpVaultCredentials;
    providerConfig: HashicorpVaultProviderConfig;
    reference: VaultSecretReference;
    value: VaultSecretValue;
  };
}

export type CredentialsForProvider<T extends SecretProviderType> = ProviderTypeMap[T]["credentials"];
export type ProviderConfigForProvider<T extends SecretProviderType> = ProviderTypeMap[T]["providerConfig"];
export type ReferenceForProvider<T extends SecretProviderType> = ProviderTypeMap[T]["reference"];
export type ValueForProvider<T extends SecretProviderType> = ProviderTypeMap[T]["value"];
