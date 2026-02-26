import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { EntityNotFound, UpdateCommand } from "../types";
import { ApiClientEntityType } from "./types";
import { ApiClientEntity, ApiClientEntityMeta } from "./base";
import { secretsManagerActions, providersAdapter, secretsAdapter } from "../secrets-manager/slice";
import { SecretProviderMetadata, SecretValue } from "@requestly/shared/types/entities/secretsManager";

export class SecretProviderEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientEntity<
  SecretProviderMetadata,
  M
> {
  readonly type = ApiClientEntityType.SECRET_PROVIDER;

  dispatchCommand(command: UpdateCommand<SecretProviderMetadata>): void {
    throw new Error("SecretProviderEntity does not support dispatchCommand. Use unsafePatch instead.");
  }

  upsert(params: SecretProviderMetadata): void {
    this.dispatch(secretsManagerActions.upsertProvider(params));
  }

  getName(): string {
    return this.getEntityFromState(this.meta as any).name;
  }

  getEntityFromState(state: ApiClientStoreState): SecretProviderMetadata {
    const secretsManagerState = state.secretsManager;
    if (!secretsManagerState) {
      throw new EntityNotFound(this.id, "secretsManager state");
    }

    const provider = providersAdapter.getSelectors().selectById(secretsManagerState.providers, this.id);
    if (!provider) {
      throw new EntityNotFound(this.id, "secret_provider");
    }
    return provider;
  }

  dispatchUnsafePatch(patcher: (provider: SecretProviderMetadata) => void): void {
    this.dispatch(
      secretsManagerActions.unsafePatchProvider({
        id: this.id,
        patcher,
      })
    );
  }

  unsafePatch(patcher: (provider: SecretProviderMetadata) => void): void {
    this.dispatchUnsafePatch(patcher);
  }

  delete(): void {
    this.dispatch(secretsManagerActions.removeProvider(this.id));
  }

  getType(state: ApiClientStoreState) {
    return this.getEntityFromState(state).type;
  }

  setName(name: string): void {
    this.unsafePatch((provider) => {
      provider.name = name;
    });
  }

  getCreatedAt(state: ApiClientStoreState) {
    return this.getEntityFromState(state).createdAt;
  }

  getUpdatedAt(state: ApiClientStoreState) {
    return this.getEntityFromState(state).updatedAt;
  }
}

export class SecretValueEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientEntity<
  SecretValue,
  M
> {
  readonly type = ApiClientEntityType.SECRET_VALUE;

  dispatchCommand(command: UpdateCommand<SecretValue>): void {
    throw new Error("SecretValueEntity does not support dispatchCommand. Use unsafePatch instead.");
  }

  upsert(params: SecretValue): void {
    this.dispatch(secretsManagerActions.upsertSecrets([params]));
  }

  getName(): string {
    return this.getEntityFromState(this.meta as any).secretReference.identifier;
  }

  getEntityFromState(state: ApiClientStoreState): SecretValue {
    const secretsManagerState = state.secretsManager;
    if (!secretsManagerState) {
      throw new EntityNotFound(this.id, "secretsManager state");
    }

    const secret = secretsAdapter.getSelectors().selectById(secretsManagerState.secrets, this.id);
    if (!secret) {
      throw new EntityNotFound(this.id, "secret_value");
    }
    return secret;
  }

  dispatchUnsafePatch(patcher: (secret: SecretValue) => void): void {
    this.dispatch(
      secretsManagerActions.unsafePatchSecret({
        id: this.id,
        patcher,
      })
    );
  }

  unsafePatch(patcher: (secret: SecretValue) => void): void {
    this.dispatchUnsafePatch(patcher);
  }

  delete(): void {
    this.dispatch(secretsManagerActions.removeSecret(this.id));
  }

  getSecretReference(state: ApiClientStoreState) {
    return this.getEntityFromState(state).secretReference;
  }

  getProviderId(state: ApiClientStoreState) {
    return this.getEntityFromState(state).providerId;
  }

  getFetchedAt(state: ApiClientStoreState) {
    return this.getEntityFromState(state).fetchedAt;
  }

  getType(state: ApiClientStoreState) {
    return this.getEntityFromState(state).type;
  }
}
