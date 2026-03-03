import { SecretProviderMetadata, SecretValue } from "@requestly/shared/types/entities/secretsManager";
import { EntityNotFound } from "../../types";
import { bufferAdapterSelectors, bufferActions } from "../../buffer/slice";
import type { ApiClientRootState } from "../../hooks/types";
import { SecretProviderEntity, SecretValueEntity } from "../secretsManager";
import type { BufferedApiClientEntity, BufferedApiClientEntityMeta } from "./factory";
import type { EntityDispatch } from "../types";

export class BufferedSecretProviderEntity
  extends SecretProviderEntity<BufferedApiClientEntityMeta>
  implements BufferedApiClientEntity {
  origin: SecretProviderEntity;

  constructor(dispatch: EntityDispatch, meta: BufferedApiClientEntityMeta) {
    super(dispatch, meta);
    this.origin = new SecretProviderEntity(dispatch, { id: meta.referenceId });
  }

  getEntityFromState(state: ApiClientRootState): SecretProviderMetadata {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as SecretProviderMetadata;
  }

  dispatchUnsafePatch(patcher: (provider: SecretProviderMetadata) => void): void {
    this.dispatch(
      bufferActions.unsafePatch({
        id: this.meta.id,
        patcher: (entry) => {
          patcher(entry.current as SecretProviderMetadata);
        },
      })
    );
  }
}

export class BufferedSecretValueEntity
  extends SecretValueEntity<BufferedApiClientEntityMeta>
  implements BufferedApiClientEntity {
  origin: SecretValueEntity;

  constructor(dispatch: EntityDispatch, meta: BufferedApiClientEntityMeta) {
    super(dispatch, meta);
    this.origin = new SecretValueEntity(dispatch, { id: meta.referenceId });
  }

  getEntityFromState(state: ApiClientRootState): SecretValue {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as SecretValue;
  }

  dispatchUnsafePatch(patcher: (secret: SecretValue) => void): void {
    this.dispatch(
      bufferActions.unsafePatch({
        id: this.meta.id,
        patcher: (entry) => {
          patcher(entry.current as SecretValue);
        },
      })
    );
  }
}
