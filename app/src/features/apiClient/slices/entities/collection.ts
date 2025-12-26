import {  RQAPI } from "features/apiClient/types";
import { InvalidEntityShape } from "../types";
import { selectRecordById } from "../apiRecords/selectors";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientRecordEntity } from "./api-client-record-entity";
import { ApiClientEntityType } from "./types";
import { ApiClientVariables } from "./api-client-variables";

export class CollectionRecordEntity extends ApiClientRecordEntity<RQAPI.CollectionRecord> {
  public readonly variables = new ApiClientVariables<RQAPI.CollectionRecord>(
    (e) => e.data.variables,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this),
  )
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


  setVariables() {
    this.SET({
      data: {
        variables: {},
      }
    })
  }

}

