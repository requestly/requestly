import type { RQAPI } from "features/apiClient/types";
import { EntityNotFound } from "../../types";
import { bufferAdapterSelectors, bufferActions } from "../../buffer/slice";
import type { ApiClientRootState } from "../../hooks/types";
import { CollectionRecordEntity } from "../collection";
import { ApiClientVariables } from "../api-client-variables";

export class BufferedCollectionRecordEntity extends CollectionRecordEntity {
  override readonly variables = new ApiClientVariables<RQAPI.CollectionRecord, ApiClientRootState>(
    (e) => e.data.variables,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );

  override getEntityFromState(state: ApiClientRootState): RQAPI.CollectionRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as RQAPI.CollectionRecord;
  }

  override dispatchUnsafePatch(patcher: (collection: RQAPI.CollectionRecord) => void): void {
    this.dispatch(
      bufferActions.unsafePatch({
        id: this.meta.id,
        patcher: (entry) => {
          patcher(entry.current as RQAPI.CollectionRecord);
        },
      })
    );
  }
}
