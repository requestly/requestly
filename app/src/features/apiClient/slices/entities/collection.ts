import {  RQAPI } from "features/apiClient/types";
import { InvalidEntityShape, UpdateCommand } from "../types";
import { selectRecordById } from "../apiRecords/selectors";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientRecordEntity } from "./api-client-record-entity";
import { ApiClientEntityType } from "./types";
import { ApiClientVariables } from "./api-client-variables";
import { ApiClientEntityMeta } from "./base";
import { apiRecordsActions } from "../apiRecords";

export class CollectionRecordEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientRecordEntity<RQAPI.CollectionRecord, M> {
  public readonly variables = new ApiClientVariables<RQAPI.CollectionRecord>(
    (e) => e.data.variables,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this),
  )
  
  dispatchCommand(command: UpdateCommand<RQAPI.CollectionRecord>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }
  
  readonly type = ApiClientEntityType.COLLECTION_RECORD;
  getEntityFromState(state: ApiClientStoreState): RQAPI.CollectionRecord {
    const record = selectRecordById(state, this.meta.id);
    if (record?.type !== RQAPI.RecordType.COLLECTION) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.RecordType.COLLECTION,
        foundType: record?.type,
      });
    }

    return record as RQAPI.CollectionRecord;
  }
}

