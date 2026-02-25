import { SecretProviderType, ProviderConfig, SecretReference } from "./baseTypes";

export interface AWSSecretsManagerCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sessionToken?: string;
}

export type AWSSecretProviderConfig = ProviderConfig<
  SecretProviderType.AWS_SECRETS_MANAGER,
  AWSSecretsManagerCredentials
>;

export interface AwsSecretReference extends SecretReference<SecretProviderType.AWS_SECRETS_MANAGER> {
  identifier: string;
  version?: string;
}

export interface AwsSecretValue {
  type: SecretProviderType.AWS_SECRETS_MANAGER;
  providerId: string;
  secretReference: AwsSecretReference;
  fetchedAt: number;
  name: string;
  value: string;
  ARN: string;
  versionId: string;
}
