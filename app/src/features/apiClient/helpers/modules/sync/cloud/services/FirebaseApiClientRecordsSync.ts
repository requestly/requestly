import { deleteApiRecords, getApiRecord, getApiRecords, upsertApiRecord } from "backend/apiClient";
import { ApiClientCloudMeta, ApiClientRecordsInterface } from "../../interfaces";
import { generateDocumentId, getOwnerId } from "backend/utils";
import { RQAPI } from "features/apiClient/types";
import { sanitizeRecord, updateApiRecord } from "backend/apiClient/upsertApiRecord";

export class FirebaseApiClientRecordsSync implements ApiClientRecordsInterface<ApiClientCloudMeta> {
  meta: ApiClientCloudMeta;

  constructor(readonly metadata: ApiClientCloudMeta) {
    this.meta = metadata;
  }

  private getPrimaryId() {
    return getOwnerId(this.meta.uid, this.meta.teamId);
  }

  generateApiRecordId(parentId?: string) {
		return generateDocumentId("apis");
	}

	generateCollectionId(name: string, parentId?: string) {
		return generateDocumentId("apis");
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

  async createCollection(record: Partial<RQAPI.Record>) {
		return this.createRecord(record);
  }

  async createRecordWithId(record: Partial<RQAPI.Record>, id: string) {
    return upsertApiRecord(this.meta.uid, record, this.meta.teamId, id);
  }

  async updateRecord(record: Partial<Omit<RQAPI.Record, 'id'>>, id: string) {
		const sanitizedRecord = sanitizeRecord(record as RQAPI.Record);
    return updateApiRecord(this.meta.uid, sanitizedRecord, this.meta.teamId);
  }

  async deleteRecords(recordIds: string[]) {
    return deleteApiRecords(this.meta.uid, recordIds, this.meta.teamId);
  }
}
