import { RQAPI } from "features/apiClient/types";
import { InvalidEntityShape, EntityNotFound, UpdateCommand } from "../../types";
import { bufferActions, bufferAdapterSelectors } from "../../buffer/slice";
import { ApiClientRootState } from "../../hooks/types";
import { HttpRecordEntity } from "../http";

export class BufferedHttpRecordEntity extends HttpRecordEntity {
  override dispatchCommand(command: UpdateCommand<RQAPI.HttpApiRecord>): void {
    this.dispatch(bufferActions.applyPatch({ id: this.meta.id, command }));
  }

  override getEntityFromState(state: ApiClientRootState): RQAPI.HttpApiRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }

    const record = entry.current as RQAPI.ApiClientRecord;
    if (record.type !== RQAPI.RecordType.API) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.RecordType.API,
        foundType: record.type, 
      });
    }
    if (record.data?.type !== RQAPI.ApiEntryType.HTTP) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.ApiEntryType.HTTP,
        foundType: record.data?.type,
      });
    }

    return record as RQAPI.HttpApiRecord;
  }
}

