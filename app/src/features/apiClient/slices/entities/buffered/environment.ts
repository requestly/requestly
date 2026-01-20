import type { EnvironmentEntity as EnvironmentRecord } from "../../environments/types";
import { EntityNotFound } from "../../types";
import { bufferAdapterSelectors, bufferActions } from "../../buffer/slice";
import type { ApiClientRootState } from "../../hooks/types";
import { EnvironmentEntity, GlobalEnvironmentEntity } from "../environment";
import { ApiClientVariables } from "../api-client-variables";
import { EntityDispatch } from "../types";
import type { ApiClientEntityMeta } from "../base";

import { BufferedApiClientEntity, BufferedApiClientEntityMeta } from "./factory";

export class BufferedEnvironmentEntity
  extends EnvironmentEntity<BufferedApiClientEntityMeta>
  implements BufferedApiClientEntity {
  origin: EnvironmentEntity<ApiClientEntityMeta>;

  constructor(public readonly dispatch: EntityDispatch, public readonly meta: BufferedApiClientEntityMeta) {
    super(dispatch, meta);
    if (!this.meta.originExists || !this.meta.referenceId) {
      throw new Error(
        `BufferedEnvironmentEntity requires originExists=true and referenceId. Got: ${JSON.stringify(this.meta)}`
      );
    }
    this.origin = new EnvironmentEntity(this.dispatch, { id: this.meta.referenceId });
  }
  readonly variables = new ApiClientVariables<EnvironmentRecord, ApiClientRootState>(
    (e) => e.variables,
    (e) => e.variablesOrder,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );

  getEntityFromState(state: ApiClientRootState): EnvironmentRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as EnvironmentRecord;
  }

  dispatchUnsafePatch(patcher: (env: EnvironmentRecord) => void): void {
    this.dispatch(
      bufferActions.unsafePatch({
        id: this.meta.id,
        patcher: (entry) => {
          patcher(entry.current as EnvironmentRecord);
        },
      })
    );
  }
}

export class BufferedGlobalEnvironmentEntity
  extends GlobalEnvironmentEntity<BufferedApiClientEntityMeta>
  implements BufferedApiClientEntity {
  origin: GlobalEnvironmentEntity;
  constructor(public readonly dispatch: EntityDispatch, public readonly meta: BufferedApiClientEntityMeta) {
    super(dispatch);
    this.origin = new GlobalEnvironmentEntity(this.dispatch);
  }

  readonly variables = new ApiClientVariables<EnvironmentRecord, ApiClientRootState>(
    (e) => e.variables,
    (e) => e.variablesOrder,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );

  getEntityFromState(state: ApiClientRootState): EnvironmentRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as EnvironmentRecord;
  }

  dispatchUnsafePatch(patcher: (env: EnvironmentRecord) => void): void {
    this.dispatch(
      bufferActions.unsafePatch({
        id: this.meta.id,
        patcher: (entry) => {
          patcher(entry.current as EnvironmentRecord);
        },
      })
    );
  }
}
