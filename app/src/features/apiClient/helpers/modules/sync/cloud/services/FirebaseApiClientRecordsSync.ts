import { deleteApiRecords, getApiRecord, getApiRecords, upsertApiRecord } from "backend/apiClient";
import { ApiClientCloudMeta, ApiClientRecordsInterface } from "../../interfaces";
import { batchWrite, firebaseBatchWrite, generateDocumentId, getOwnerId } from "backend/utils";
import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { omit } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { sanitizeRecord, updateApiRecord } from "backend/apiClient/upsertApiRecord";
import { EnvironmentVariables } from "backend/environment/types";
import { ErroredRecord } from "../../local/services/types";

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
    const result = await getApiRecords(this.getPrimaryId());
    return {
      success: result.success,
      data: {
        records: result.data,
        erroredRecords: [] as ErroredRecord[],
      },
    };
  }

  getRecordsForForceRefresh(): RQAPI.RecordsPromise | Promise<void> {
    return;
  }

  async getRecord(recordId: string) {
    return getApiRecord(recordId);
  }

  async getCollection(recordId: string) {
    return getApiRecord(recordId);
  }

  async renameCollection(id: string, newName: string): RQAPI.RecordPromise {
    return this.updateRecord({ id, name: newName }, id, RQAPI.RecordType.COLLECTION);
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

  async updateRecord(record: Partial<RQAPI.Record>, id: string, type?: RQAPI.Record['type']) {
    const sanitizedRecord = sanitizeRecord(record as RQAPI.Record);
    sanitizedRecord.id = id;
    if (type) {
      sanitizedRecord.type = type;
    }
    return updateApiRecord(this.meta.uid, sanitizedRecord, this.meta.teamId);
  }

  async deleteRecords(recordIds: string[]) {
    return deleteApiRecords(this.meta.uid, recordIds, this.meta.teamId);
  }

  async deleteCollections(ids: string[]) {
    return deleteApiRecords(this.meta.uid, ids, this.meta.teamId);
  }

  async setCollectionVariables(
    id: string,
    variables: EnvironmentVariables
  ): Promise<{ success: boolean; data: unknown; message?: string }> {
    const record = await this.getCollection(id);
    const updatedRecord: RQAPI.CollectionRecord = {
      ...record.data,
      type: RQAPI.RecordType.COLLECTION,
      data: {
        ...record.data.data,
        variables,
      },
    };
    return this.updateRecord(updatedRecord, updatedRecord.id);
  }

  async updateCollectionDescription(
    id: string,
    description: string
  ): Promise<{ success: boolean; data: string; message?: string }> {
    const result = await this.updateRecord({ id, description }, id);
    return {
      success: result.success,
      data: result.data.description,
      message: "Something went wrong while updating collection description",
    };
  }

  async updateCollectionAuthData(
    collection: RQAPI.CollectionRecord
  ): Promise<{ success: boolean; data: RQAPI.Record; message?: string }> {
    return this.updateRecord(collection, collection.id);
  }

  async writeToRawFile(): Promise<{ success: boolean; data: RQAPI.Record; message?: string }> {
    return {
      success: true,
      data: undefined,
    };
  }

  async getRawFileData(id: string): Promise<{ success: boolean; data: unknown; message?: string }> {
    return {
      success: true,
      data: undefined,
    };
  }

  async createCollectionFromImport(
    collection: RQAPI.CollectionRecord,
    id: string
  ): Promise<{ success: boolean; data: RQAPI.Record; message?: string }> {
    return this.createRecordWithId(collection, id);
  }

  async batchWriteApiEntities(
    batchSize: number,
    entities: RQAPI.Record[],
    writeFunction: (entity: RQAPI.Record) => Promise<any>
  ) {
    try {
      const result = await batchWrite(batchSize, entities, writeFunction);
      return {
        success: result.every((r) => r.status === "fulfilled"),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async duplicateApiEntities(entities: RQAPI.Record[]) {
    return firebaseBatchWrite("apis", entities);
  }

  async moveAPIEntities(entities: RQAPI.Record[], newParentId: string) {
    const updatedRequests = entities.map((record) =>
      isApiCollection(record)
        ? { ...record, collectionId: newParentId, data: omit(record.data, "children") }
        : { ...record, collectionId: newParentId }
    );
    return await firebaseBatchWrite("apis", updatedRequests);
  }
}
