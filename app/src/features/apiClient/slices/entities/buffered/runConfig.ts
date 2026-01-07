import { parseRunnerConfigKey, RunConfigEntity as RunConfigRecord } from "../../runConfig/types";
import { EntityNotFound } from "../../types";
import { bufferAdapterSelectors, bufferActions } from "../../buffer/slice";
import type { ApiClientRootState } from "../../hooks/types";
import { RunConfigEntity } from "../runConfig";
import type { BufferedApiClientEntity, BufferedApiClientEntityMeta } from "./factory";
import type { EntityDispatch } from "../types";

export class BufferedRunConfigEntity
  extends RunConfigEntity<BufferedApiClientEntityMeta>
  implements BufferedApiClientEntity {
  origin: RunConfigEntity;

  constructor(dispatch: EntityDispatch, meta: BufferedApiClientEntityMeta) {
    super(dispatch, meta);
    this.origin = new RunConfigEntity(dispatch, { id: meta.referenceId });
  }

  getEntityFromState(state: ApiClientRootState): RunConfigRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as RunConfigRecord;
  }

  dispatchUnsafePatch(patcher: (config: RunConfigRecord) => void): void {
    this.dispatch(
      bufferActions.unsafePatch({
        id: this.meta.id,
        patcher: (entry) => {
          patcher(entry.current as RunConfigRecord);
        },
      })
    );
  }
}
