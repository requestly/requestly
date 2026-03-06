import {
  SecretProviderConfig,
  SecretProviderMetadata,
  SecretProviderType,
  SecretReference,
  SecretValue,
  AWSSecretProviderConfig,
  AWSSecretsManagerCredentials,
} from "@requestly/shared/types/entities/secretsManager";
import { ProviderData } from "features/settings/secrets-manager/context/SecretsModalsContext";

type SecretsResult<T> = { type: "success"; data: T } | { type: "error"; error: { code: string; message: string } };
type SecretsVoidResult = { type: "success" } | { type: "error"; error: { code: string; message: string } };

const invokeMainEvent = <T = unknown>(channel: string, payload?: Record<string, unknown>): Promise<T> => {
  return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain(channel, payload);
};

export const secretsManagerService = {
  init: (): Promise<SecretsVoidResult> => {
    return invokeMainEvent("secretsManager:init");
  },

  subscribeToProvidersChange: (callback: (providers: SecretProviderMetadata[]) => void): void => {
    invokeMainEvent("secretsManager:subscribeToProvidersChange");
    window.RQ.DESKTOP.SERVICES.IPC.registerEvent("secretsManager:providersChanged", callback);
  },

  unsubscribeFromProvidersChange: (): void => {
    window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent("secretsManager:providersChanged");
  },

  listProviders: (): Promise<SecretsResult<SecretProviderMetadata[]>> => {
    return invokeMainEvent("secretsManager:listSecretProviders");
  },

  setProviderConfig: (config: SecretProviderConfig): Promise<SecretsVoidResult> => {
    return invokeMainEvent("secretsManager:setSecretProviderConfig", { config });
  },

  getProviderConfig: (providerId: string): Promise<SecretsResult<SecretProviderConfig | null>> => {
    return invokeMainEvent("secretsManager:getSecretProviderConfig", { providerId });
  },

  removeProviderConfig: (providerId: string): Promise<SecretsVoidResult> => {
    return invokeMainEvent("secretsManager:removeSecretProviderConfig", { providerId });
  },

  testConnection: (providerId: string): Promise<SecretsResult<boolean>> => {
    return invokeMainEvent("secretsManager:testProviderConnection", { providerId });
  },

  testConnectionWithConfig: (config: SecretProviderConfig): Promise<SecretsResult<boolean>> => {
    return invokeMainEvent("secretsManager:testProviderConnectionWithConfig", { config });
  },

  getSecretValue: (
    providerId: string,
    secretReference: SecretReference
  ): Promise<SecretsResult<SecretValue | null>> => {
    return invokeMainEvent("secretsManager:getSecretValue", { providerId, secretReference });
  },

  getSecretValues: (
    secrets: Array<{ providerId: string; ref: SecretReference }>
  ): Promise<SecretsResult<SecretValue[]>> => {
    return invokeMainEvent("secretsManager:getSecretValues", { secrets });
  },

  refreshSecrets: (providerId: string): Promise<SecretsResult<(SecretValue | null)[]>> => {
    return invokeMainEvent("secretsManager:refreshSecrets", { providerId });
  },
};

/**
 * Maps UI form data to a SecretProviderConfig for IPC calls.
 * Generates a new UUID for new providers; reuses existingId for edits.
 */
export function toSecretProviderConfig(formData: Partial<ProviderData>, existingId?: string): SecretProviderConfig {
  const providerType = mapSecretManagerStringToType(formData.secretManagerType);
  const now = Date.now();

  switch (providerType) {
    case SecretProviderType.AWS_SECRETS_MANAGER: {
      const config: AWSSecretProviderConfig = {
        id: existingId ?? crypto.randomUUID(),
        type: SecretProviderType.AWS_SECRETS_MANAGER,
        name: formData.instanceName ?? "",
        createdAt: existingId ? (formData.createdAt as number) ?? now : now,
        updatedAt: now,
        credentials: {
          accessKeyId: formData.accessKey ?? "",
          secretAccessKey: formData.secretKey ?? "",
          region: formData.region ?? "",
          sessionToken: formData.sessionToken || undefined,
        },
      };
      return config;
    }
    default:
      throw new Error(`Unsupported provider type: ${formData.secretManagerType}`);
  }
}

/**
 * Maps a SecretProviderConfig (with credentials) back to UI form data for the edit modal.
 */
export function toProviderData(config: SecretProviderConfig): ProviderData {
  switch (config.type) {
    case SecretProviderType.AWS_SECRETS_MANAGER: {
      const creds = config.credentials as AWSSecretsManagerCredentials;
      return {
        instanceName: config.name,
        secretManagerType: SecretProviderType.AWS_SECRETS_MANAGER,
        authMethod: "manual",
        accessKey: creds.accessKeyId,
        secretKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken,
        region: creds.region,
        createdAt: config.createdAt,
      };
    }
    default:
      throw new Error(`Unsupported provider type: ${(config as SecretProviderConfig).type}`);
  }
}

export function mapSecretManagerStringToType(value?: string): SecretProviderType {
  switch (value) {
    case SecretProviderType.AWS_SECRETS_MANAGER:
    case "AWS Secrets Manager":
      return SecretProviderType.AWS_SECRETS_MANAGER;
    case SecretProviderType.HASHICORP_VAULT:
    case "HashiCorp Vault":
      return SecretProviderType.HASHICORP_VAULT;
    default:
      throw new Error(`Unknown secret provider type: ${value}`);
  }
}

export function mapProviderTypeToDisplayString(type: SecretProviderType): string {
  switch (type) {
    case SecretProviderType.AWS_SECRETS_MANAGER:
      return "AWS Secrets Manager";
    case SecretProviderType.HASHICORP_VAULT:
      return "HashiCorp Vault";
    default:
      return type;
  }
}
