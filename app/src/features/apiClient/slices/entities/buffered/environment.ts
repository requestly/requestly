import type { EnvironmentEntity as EnvironmentRecord } from "../../environments/types";
import { EntityNotFound } from "../../types";
import { bufferAdapterSelectors, bufferActions } from "../../buffer/slice";
import type { ApiClientRootState } from "../../hooks/types";
import { EnvironmentEntity, GlobalEnvironmentEntity } from "../environment";
import { ApiClientVariables } from "../api-client-variables";
import { EntityDispatch } from "../types";
import { ApiClientEntityMeta } from "../base";

export class BufferedEnvironmentEntity extends EnvironmentEntity {
  override readonly variables = new ApiClientVariables<EnvironmentRecord, ApiClientRootState>(
    (e) => e.variables,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );

  override getEntityFromState(state: ApiClientRootState): EnvironmentRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as EnvironmentRecord;
  }

  override dispatchUnsafePatch(patcher: (env: EnvironmentRecord) => void): void {
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

export class BufferedGlobalEnvironmentEntity extends GlobalEnvironmentEntity {
  constructor(protected readonly dispatch: EntityDispatch, public readonly meta: ApiClientEntityMeta) {
    super(dispatch);
  }

  override readonly variables = new ApiClientVariables<EnvironmentRecord, ApiClientRootState>(
    (e) => e.variables,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );

  override getEntityFromState(state: ApiClientRootState): EnvironmentRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as EnvironmentRecord;
  }

  override dispatchUnsafePatch(patcher: (env: EnvironmentRecord) => void): void {
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
