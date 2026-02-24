import { RQAPI } from "features/apiClient/types";
import { InvalidEntityShape, EntityNotFound, UpdateCommand } from "../../types";
import { bufferActions, bufferAdapterSelectors } from "../../buffer/slice";
import { ApiClientRootState } from "../../hooks/types";
import { HttpRecordEntity } from "../http";
import { BufferedApiClientEntity, BufferedApiClientEntityMeta } from "./factory";

export class BufferedHttpRecordEntity
  extends HttpRecordEntity<BufferedApiClientEntityMeta>
  implements BufferedApiClientEntity
{
  origin = new HttpRecordEntity(this.dispatch, { id: this.meta.referenceId });
  dispatchCommand(command: UpdateCommand<RQAPI.HttpApiRecord>): void {
    this.dispatch(bufferActions.applyPatch({ id: this.meta.id, command }));
  }

  getEntityFromState(state: ApiClientRootState): RQAPI.HttpApiRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }

    const record = entry.current as RQAPI.ApiClientRecord;
    if (record.type !== RQAPI.RecordType.API && record.type !== RQAPI.RecordType.EXAMPLE_API) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.RecordType.API,
        foundType: record.type,
      });
    }
    const entryType = record.data?.type;
    if (entryType && entryType !== RQAPI.ApiEntryType.HTTP) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.ApiEntryType.HTTP,
        foundType: entryType,
      });
    }

    return record as RQAPI.HttpApiRecord;
  }

  dispatchUnsafePatch(patcher: (record: RQAPI.HttpApiRecord) => void): void {
    this.dispatch(
      bufferActions.unsafePatch({
        id: this.meta.id,
        patcher: (entry) => {
          patcher(entry.current as RQAPI.HttpApiRecord);
        },
      })
    );
  }
}
