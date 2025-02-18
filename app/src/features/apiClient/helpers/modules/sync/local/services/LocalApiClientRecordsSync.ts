import { ApiClientLocalMeta, ApiClientRecordsInterface } from "../../interfaces";
import { RQAPI } from "features/apiClient/types";

export class LocalApiClientRecordsSync implements ApiClientRecordsInterface<ApiClientLocalMeta> {
  meta: ApiClientLocalMeta;

  constructor(readonly metadata: ApiClientLocalMeta) {
    this.meta = metadata;
  }
    async getAllRecords(): RQAPI.RecordsPromise {
			return [] as any;
    }
    getRecord(recordId: string): RQAPI.RecordPromise {
        throw new Error("Method not implemented.");
    }
    createRecord(record: Partial<RQAPI.Record>): RQAPI.RecordPromise {
        throw new Error("Method not implemented.");
    }
    createRecordWithId(record: Partial<RQAPI.Record>, id: string): RQAPI.RecordPromise {
        throw new Error("Method not implemented.");
    }
    updateRecord(record: Partial<RQAPI.Record>, id?: string): RQAPI.RecordPromise {
        throw new Error("Method not implemented.");
    }
    deleteRecords(recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string; }> {
        throw new Error("Method not implemented.");
    }
}
