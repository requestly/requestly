import { RQAPI } from "features/apiClient/types";
import { ApiClientLocalStoreMeta, ApiClientRecordsInterface } from "../../interfaces";
import { ErroredRecord } from "../../local/services/types";
import { sanitizeRecord } from "backend/apiClient/upsertApiRecord";
import { Timestamp } from "firebase/firestore";
import { EnvironmentVariables } from "backend/environment/types";
import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { omit } from "lodash";
import { ApiClientLocalStorage } from "../helpers/ApiClientLocalStorage";
import { generateDocumentId } from "backend/utils";

export class LocalStoreRecordsSync implements ApiClientRecordsInterface<ApiClientLocalStoreMeta> {
  public static meta: ApiClientLocalStoreMeta;
  public meta: ApiClientLocalStoreMeta;
  private storageInstance: ApiClientLocalStorage;

  constructor(readonly metadata: ApiClientLocalStoreMeta) {
    this.meta = metadata;
    this.storageInstance = ApiClientLocalStorage.getInstance();
  }

  private getNewId() {
    return generateDocumentId("apis");
  }

  private getLocalStorageRecords() {
    return this.storageInstance.getRecords();
  }

  async getAllRecords() {
    const records = this.getLocalStorageRecords();

    return {
      success: true,
      data: {
        records: records.apis.filter((record) => !record.deleted),
        erroredRecords: [] as ErroredRecord[],
      },
    };
  }

  async getApiRecord(recordId: string): RQAPI.RecordPromise {
    const records = this.getLocalStorageRecords();
    const record = records.apis.find((record) => record.id === recordId);
    if (record) {
      return {
        success: true,
        data: record,
      };
    } else {
      return { success: false, data: null, message: "Not found!" };
    }
  }

  async getRecord(recordId: string) {
    return this.getApiRecord(recordId);
  }

  async createRecord(record: Partial<RQAPI.Record>): RQAPI.RecordPromise {
    const sanitizedRecord = sanitizeRecord(record as RQAPI.Record);

    const newRecord = {
      ...sanitizedRecord,
      id: this.getNewId(),
      name: record.name || "Untitled request",
      type: record.type,
      data: sanitizedRecord.data,
      collectionId: record.collectionId || "",
      description: record.description || "",
      deleted: false,
      ownerId: null,
      createdBy: null,
      updatedBy: null,
      createdTs: Timestamp.now().toMillis(),
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.Record;

    const records = this.getLocalStorageRecords();
    records.apis.push(newRecord);

    this.storageInstance.setRecords(records);
    return { success: true, data: newRecord };
  }

  async createCollection(record: Partial<RQAPI.Record>) {
    return this.createRecord(record);
  }

  // TODO: refactor this to avoid code duplication
  async createRecordWithId(record: Partial<RQAPI.Record>, id: string) {
    const sanitizedRecord = sanitizeRecord(record as RQAPI.Record);

    const newRecord = {
      ...sanitizedRecord,
      id,
      name: record.name || "Untitled request",
      type: record.type,
      data: sanitizedRecord.data,
      collectionId: record.collectionId || "",
      description: record.description || "",
      deleted: false,
      ownerId: null,
      createdBy: null,
      updatedBy: null,
      createdTs: Timestamp.now().toMillis(),
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.Record;

    const records = this.getLocalStorageRecords();
    records.apis.push(newRecord);
    this.storageInstance.setRecords(records);
    return { success: true, data: newRecord };
  }

  async updateRecord(record: Partial<RQAPI.Record>, id: string): RQAPI.RecordPromise {
    const sanitizedRecord = sanitizeRecord(record as RQAPI.Record);
    sanitizedRecord.id = id;

    const records = this.getLocalStorageRecords();
    const index = records.apis.findIndex((record) => record.id === id);

    if (index === -1) {
      return { success: false, data: null, message: "Record not found!" };
    }

    const updatedRecord = {
      ...records.apis[index],
      ...sanitizedRecord,
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.Record;

    records.apis[index] = updatedRecord;
    this.storageInstance.setRecords(records);
    return { success: true, data: updatedRecord };
  }

  async deleteRecords(recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string }> {
    const records = this.getLocalStorageRecords();
    const updatedApis = records.apis.map((record) => {
      if (recordIds.includes(record.id)) {
        return {
          ...record,
          deleted: true,
          updatedTs: Timestamp.now().toMillis(),
        };
      }
      return record;
    });

    records.apis = updatedApis;
    this.storageInstance.setRecords(records);
    return { success: true, data: null };
  }

  async deleteCollections(recordIds: string[]) {
    return this.deleteRecords(recordIds);
  }

  async getCollection(recordId: string) {
    return this.getApiRecord(recordId);
  }

  async setCollectionVariables(
    id: string,
    variables: EnvironmentVariables
  ): Promise<{ success: boolean; data: unknown; message?: string }> {
    const record = await this.getCollection(id);

    if (!record.success) {
      return { success: false, data: null, message: "Collection not found!" };
    }

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

  async renameCollection(id: string, newName: string) {
    return this.updateRecord({ id, name: newName }, id);
  }

  async updateCollectionDescription(id: string, description: string) {
    const result = await this.updateRecord({ id, description }, id);
    return {
      success: result.success,
      data: result.data.description,
      message: "Something went wrong while updating collection description",
    };
  }

  async updateCollectionAuthData(collection: RQAPI.CollectionRecord) {
    return this.updateRecord(collection, collection.id);
  }

  async getRecordsForForceRefresh() {
    return;
  }

  generateApiRecordId(parentId?: string) {
    return this.getNewId();
  }

  generateCollectionId(name: string, parentId?: string) {
    return this.getNewId();
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
      for (const entity of entities) {
        await writeFunction(entity);
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: true,
    };
  }

  async batchCreateRecordsWithExistingId(records: RQAPI.Record[]): RQAPI.RecordsPromise {
    return {
      success: true,
      data: {
        records: [],
        erroredRecords: [],
      },
    };
  }

  async duplicateApiEntities(entities: RQAPI.Record[]) {
    const result: RQAPI.Record[] = [];
    for (const entity of entities) {
      const duplicationResult = await (async () => {
        if (entity.type === RQAPI.RecordType.API) {
          return this.createRecordWithId(entity, entity.id);
        }
        return this.createCollectionFromImport(entity, entity.id);
      })();

      if (duplicationResult.success) {
        result.push(duplicationResult.data);
      }
    }
    return result;
  }

  async moveAPIEntities(entities: RQAPI.Record[], newParentId: string) {
    const updatedRequests = entities.map((record) =>
      isApiCollection(record)
        ? {
            ...record,
            updatedTs: Timestamp.now().toMillis(),
            collectionId: newParentId,
            data: omit(record.data, "children"),
          }
        : { ...record, updatedTs: Timestamp.now().toMillis(), collectionId: newParentId }
    );

    const updatedRequestsMap = entities.reduce(
      (result, record) => ({ ...result, [record.id]: record }),
      {} as Record<string, RQAPI.Record>
    );

    const records = this.getLocalStorageRecords();
    const updatedRecords = records.apis.map((record) => {
      if (updatedRequestsMap[record.id]) {
        return updatedRequestsMap[record.id];
      }
      return record;
    });

    records.apis = updatedRecords;
    this.storageInstance.setRecords(records);
    return updatedRequests;
  }
}
