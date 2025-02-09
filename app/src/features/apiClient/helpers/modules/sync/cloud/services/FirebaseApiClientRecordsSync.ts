import { deleteApiRecords, getApiRecord, getApiRecords, upsertApiRecord } from "backend/apiClient";
import { ApiClientCloudMeta, ApiClientRecordsInterface } from "../../interfaces";
import { getOwnerId } from "backend/utils";
import { RQAPI } from "features/apiClient/types";

export class FirebaseApiClientRecordsSync implements ApiClientRecordsInterface<ApiClientCloudMeta> {
  meta: ApiClientCloudMeta;

  constructor(readonly metadata: ApiClientCloudMeta) {
    this.meta = metadata;
  }

  private getPrimaryId() {
    return getOwnerId(this.meta.uid, this.meta.teamId);
  }

  async getAllRecords() {
    return getApiRecords(this.getPrimaryId());
  }

  async getRecord(recordId: string) {
    return getApiRecord(recordId);
  }

  async createRecord(record: Partial<RQAPI.Record>) {
    return upsertApiRecord(this.meta.uid, record, this.meta.teamId);
  }

  async createRecordWithId(record: Partial<RQAPI.Record>, id: string) {
    return upsertApiRecord(this.meta.uid, record, this.meta.teamId, id);
  }

  async updateRecord(record: Partial<RQAPI.Record>) {
    return upsertApiRecord(this.meta.uid, record, this.meta.teamId);
  }

  async deleteRecords(recordIds: string[]) {
    return deleteApiRecords(this.meta.uid, recordIds, this.meta.teamId);
  }
}
