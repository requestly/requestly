import type { RuntimeVariablesEntity as RuntimeVariablesRecord } from "../../runtimeVariables/types";
import { EntityNotFound } from "../../types";
import { bufferAdapterSelectors, bufferActions } from "../../buffer/slice";
import type { ApiClientRootState } from "../../hooks/types";
import { RuntimeVariablesEntity } from "../runtime-variables";
import { ApiClientVariables } from "../api-client-variables";
import { ApiClientEntityMeta } from "../base";
import { EntityDispatch } from "../types";
import { RootState } from "store/types";


export class BufferedRuntimeVariablesEntity extends RuntimeVariablesEntity {
  override readonly variables = new ApiClientVariables<RuntimeVariablesRecord, RootState>(
    (e) => e.variables,
    this.unsafePatch.bind(this),
    this.getEntityFromStateBuffered.bind(this)
  );

  constructor(dispatch: EntityDispatch, meta: ApiClientEntityMeta) {
    super(dispatch);
    (this as { meta: ApiClientEntityMeta }).meta = meta;
  }


  getEntityFromStateBuffered(state: ApiClientRootState): RuntimeVariablesRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as RuntimeVariablesRecord;
  }

  override dispatchUnsafePatch(patcher: (entity: RuntimeVariablesRecord) => void): void {
    this.dispatch(
      bufferActions.unsafePatch({
        id: this.meta.id,
        patcher: (entry) => {
          patcher(entry.current as RuntimeVariablesRecord);
        },
      })
    );
  }


  override clear(): void {
    this.unsafePatch((entity) => {
      entity.variables = {};
    });
  }
}
