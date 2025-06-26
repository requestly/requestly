import { RQAPI } from "features/apiClient/types";
import { ApiClientLocalStoreMeta, ApiClientRecordsInterface } from "../../interfaces";
import { ErroredRecord } from "../../local/services/types";
import { sanitizeRecord } from "backend/apiClient/upsertApiRecord";
import { Timestamp } from "firebase/firestore";
import { EnvironmentVariables } from "backend/environment/types";
import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { omit } from "lodash";
import { ApiClientLocalDb } from "../helpers/ApiClientLocalDb";
import { generateDocumentId } from "backend/utils";

export class LocalStoreRecordsSync implements ApiClientRecordsInterface<ApiClientLocalStoreMeta> {
  meta: ApiClientLocalStoreMeta;
  private storageInstance: ApiClientLocalDb;

  constructor(meta: ApiClientLocalStoreMeta) {
    this.storageInstance = new ApiClientLocalDb(meta);
  }

  private getNewId() {
    return generateDocumentId("apis");
  }

  async getAllRecords(): RQAPI.RecordsPromise {
    const apis = await this.storageInstance.getApiRecords();

    return {
      success: true,
      data: {
        records: apis ?? [],
        erroredRecords: [] as ErroredRecord[],
      },
    };
  }

  async getApiRecord(recordId: string): RQAPI.RecordPromise {
    const record = await this.storageInstance.getApiRecord(recordId);

    if (record) {
      return {
        success: true,
        data: record,
      };
    } else {
      return { success: false, data: null, message: "Record not found!" };
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

    await this.storageInstance.createApiRecord(newRecord);
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

    await this.storageInstance.createApiRecord(newRecord);
    return { success: true, data: newRecord };
  }

  async updateRecord(record: Partial<RQAPI.Record>, id: string): RQAPI.RecordPromise {
    const sanitizedRecord = sanitizeRecord(record as RQAPI.Record);

    const updatedRecord = {
      ...sanitizedRecord,
      id,
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.Record;

    await this.storageInstance.updateApiRecord(id, updatedRecord);
    return { success: true, data: updatedRecord };
  }

  async deleteRecords(recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string }> {
    const recordsToBeDeleted = recordIds.map((id) => {
      return {
        id,
        deleted: true,
        updatedTs: Timestamp.now().toMillis(),
      };
    });

    await this.storageInstance.updateApiRecords(recordsToBeDeleted);
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

    if (result.success) {
      return {
        success: result.success,
        data: result.data.description,
      };
    }

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
    const updatedRequests = entities.map((record) => {
      return isApiCollection(record)
        ? {
            ...record,
            updatedTs: Timestamp.now().toMillis(),
            collectionId: newParentId,
            data: omit(record.data, "children"),
          }
        : { ...record, updatedTs: Timestamp.now().toMillis(), collectionId: newParentId };
    });

    await this.storageInstance.updateApiRecords(updatedRequests as Partial<RQAPI.Record>[]);
    return updatedRequests;
  }

  async clear() {
    await this.storageInstance.clearApiRecords();
  }
}
