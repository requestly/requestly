import { RQAPI } from "features/apiClient/types";
import { ApiClientLocalStoreMeta, ApiClientRecordsInterface } from "../../interfaces";
import { ErroredRecord } from "../../local/services/types";
import { sanitizeRecord } from "backend/apiClient/upsertApiRecord";
import { Timestamp } from "firebase/firestore";
import { EnvironmentVariables } from "backend/environment/types";
import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { omit } from "lodash";
import { ApiClientLocalDbQueryService } from "../helpers";
import { ApiClientLocalDbTable } from "../helpers/types";
import { v4 as uuidv4 } from "uuid";
import { ResponsePromise } from "backend/types";
import { SavedRunConfig, SavedRunConfigRecord } from "features/apiClient/commands/collectionRunner/types";
import { RunResult, SavedRunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { LocalStore } from "./types";
import { captureException } from "backend/apiClient/utils";

export class LocalStoreRecordsSync implements ApiClientRecordsInterface<ApiClientLocalStoreMeta> {
  meta: ApiClientLocalStoreMeta;
  private queryService: ApiClientLocalDbQueryService<RQAPI.ApiRecord | LocalStore.CollectionRecord>;

  constructor(meta: ApiClientLocalStoreMeta) {
    this.meta = meta;
    this.queryService = new ApiClientLocalDbQueryService<RQAPI.ApiRecord | LocalStore.CollectionRecord>(
      meta,
      ApiClientLocalDbTable.APIS
    );
  }

  private getNewId() {
    return uuidv4();
  }

  async getAllRecords(): RQAPI.RecordsPromise {
    const apis = await this.queryService.getRecords();

    return {
      success: true,
      data: {
        records: apis.filter((record) => !record.deleted),
        erroredRecords: [] as ErroredRecord[],
      },
    };
  }

  async getApiRecord(recordId: string): RQAPI.ApiClientRecordPromise {
    const record = await this.queryService.getRecord(recordId);

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

  async createRecord(record: Partial<RQAPI.ApiClientRecord>): RQAPI.ApiClientRecordPromise {
    const sanitizedRecord = sanitizeRecord(record as RQAPI.ApiClientRecord);
    const newRecord = {
      ...sanitizedRecord,
      id: this.getNewId(),
      name: record.name || "Untitled request",
      type: record.type,
      data: sanitizedRecord.data,
      collectionId: record.collectionId || "",
      description: record.description || "",
      deleted: false,
      ownerId: "",
      createdBy: "",
      updatedBy: "",
      createdTs: Timestamp.now().toMillis(),
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.ApiClientRecord;

    await this.queryService.createRecord(newRecord);
    return { success: true, data: newRecord };
  }

  async createCollection(record: Partial<RQAPI.ApiClientRecord>) {
    return this.createRecord(record);
  }

  // TODO: refactor this to avoid code duplication
  async createRecordWithId(record: Partial<RQAPI.ApiClientRecord>, id: string): RQAPI.ApiClientRecordPromise {
    const sanitizedRecord = sanitizeRecord(record as RQAPI.ApiClientRecord);

    const newRecord = {
      ...sanitizedRecord,
      id,
      name: record.name || "Untitled request",
      type: record.type,
      data: sanitizedRecord.data,
      collectionId: record.collectionId || "",
      description: record.description || "",
      deleted: false,
      ownerId: "",
      createdBy: "",
      updatedBy: "",
      createdTs: Timestamp.now().toMillis(),
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.ApiClientRecord;

    try {
      await this.queryService.createRecord(newRecord);
      return { success: true, data: newRecord };
    } catch (error) {
      captureException(error);
      return { success: false, data: null };
    }
  }

  async updateRecord(record: Partial<RQAPI.ApiClientRecord>, id: string): RQAPI.ApiClientRecordPromise {
    const sanitizedRecord = sanitizeRecord(record as RQAPI.ApiClientRecord);
    const existingRecord = await this.getApiRecord(id);

    const updatedRecord = {
      ...existingRecord.data,
      ...sanitizedRecord,
      id,
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.ApiClientRecord;

    try {
      await this.queryService.updateRecord(id, updatedRecord);
      return { success: true, data: updatedRecord };
    } catch (err) {
      captureException(err);
      return { success: false, data: null };
    }
  }

  async deleteRecords(recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string }> {
    await this.queryService.deleteRecords(recordIds);
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

    const collectionRecord: RQAPI.CollectionRecord = record.data as RQAPI.CollectionRecord;

    const updatedRecord: RQAPI.CollectionRecord = {
      ...collectionRecord,
      type: RQAPI.RecordType.COLLECTION,
      data: {
        ...collectionRecord.data,
        variables,
      },
    };

    return this.updateRecord(updatedRecord, updatedRecord.id);
  }

  async renameCollection(id: string, newName: string) {
    return this.updateRecord({ id, name: newName }, id);
  }

  async updateCollectionDescription(
    id: string,
    description: string
  ): Promise<{ success: boolean; data: string; message?: string }> {
    const result = await this.updateRecord({ id, description }, id);

    if (result.success) {
      return {
        success: result.success,
        data: result.data.description || "",
      };
    }

    return {
      success: result.success,
      data: "",
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

  async writeToRawFile(): RQAPI.ApiClientRecordPromise {
    return {
      success: true,
      data: {} as RQAPI.ApiClientRecord, // dummy response
    };
  }

  async getRawFileData(id: string): Promise<{ success: boolean; data: null; message?: string }> {
    return {
      success: true,
      data: null,
    };
  }

  async createCollectionFromImport(collection: RQAPI.CollectionRecord, id: string): RQAPI.ApiClientRecordPromise {
    return this.createRecordWithId(collection, id);
  }

  async batchWriteApiEntities(
    batchSize: number,
    entities: RQAPI.ApiClientRecord[],
    writeFunction: (entity: RQAPI.ApiClientRecord) => Promise<any>
  ) {
    try {
      for (const entity of entities) {
        await writeFunction(entity);
      }
    } catch (error) {
      captureException(error);
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: true,
    };
  }

  async batchWriteApiRecords(records: RQAPI.ApiRecord[]): Promise<RQAPI.ApiRecord[]> {
    await this.queryService.createBulkRecords(records);
    return records;
  }

  async batchCreateRecordsWithExistingId(records: RQAPI.ApiClientRecord[]): RQAPI.RecordsPromise {
    await this.queryService.createBulkRecords(records);
    return {
      success: true,
      data: {
        records: records,
        erroredRecords: [],
      },
    };
  }

  async duplicateApiEntities(entities: RQAPI.ApiClientRecord[]) {
    const result: RQAPI.ApiClientRecord[] = [];
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

  async moveAPIEntities(entities: RQAPI.ApiClientRecord[], newParentId: string) {
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

    await this.queryService.updateRecords(updatedRequests);
    return updatedRequests;
  }

  async clear() {
    await this.queryService.clearAllRecords();
  }

  async getIsAllCleared(): Promise<boolean> {
    return this.queryService.getIsAllCleared();
  }

  async batchCreateCollectionRunDetails(
    details: {
      collectionId: RQAPI.CollectionRecord["id"];
      runConfigs?: Record<string, SavedRunConfig>;
      runResults?: RunResult[];
    }[]
  ): RQAPI.RecordsPromise {
    return {
      success: false,
      data: { records: [], erroredRecords: [] },
      message: "Not implemented",
    };
  }

  private async getCollectionDetails(
    collectionId: RQAPI.ApiClientRecord["collectionId"]
  ): Promise<LocalStore.CollectionRecord | null> {
    if (collectionId == null) {
      return null;
    }

    const result = await this.getRecord(collectionId);

    if (!result.success) {
      return null;
    }

    return result.data as LocalStore.CollectionRecord;
  }

  async getRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfigId: RQAPI.RunConfig["id"]
  ): ResponsePromise<SavedRunConfig> {
    try {
      const collection = await this.getCollectionDetails(collectionId);

      if (!collection) {
        return {
          success: false,
          data: null,
          error: {
            type: "NOT_FOUND",
            message: "Collection not found!",
          },
        };
      }

      const runConfig = collection?.runConfigs?.[runConfigId];

      if (!runConfig) {
        return {
          success: false,
          data: null,
          error: {
            type: "NOT_FOUND",
            message: "Not found!",
          },
        };
      }

      return {
        success: true,
        data: {
          id: runConfigId,
          runOrder: runConfig.runOrder,
          delay: runConfig.delay,
          iterations: runConfig.iterations,
          dataFile: runConfig.dataFile,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          type: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        },
      };
    }
  }

  async upsertRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfig: SavedRunConfig
  ): ResponsePromise<SavedRunConfig> {
    try {
      const collection = await this.getCollectionDetails(collectionId);

      if (!collection) {
        return {
          success: false,
          data: null,
          error: {
            type: "NOT_FOUND",
            message: "Collection not found!",
          },
        };
      }

      const timeStamp = Timestamp.now().toMillis();
      const updatedRunConfig = {
        ...runConfig,
        updatedTs: timeStamp,
      } as SavedRunConfigRecord;

      updatedRunConfig.createdTs = collection.runConfigs?.[runConfig.id]?.createdTs || timeStamp;

      await this.updateRecord(
        {
          ...collection,
          runConfigs: {
            ...(collection.runConfigs ?? {}),
            [runConfig.id]: updatedRunConfig,
          },
        } as LocalStore.CollectionRecord,
        collection.id
      );

      return { success: true, data: { ...runConfig, id: runConfig.id } };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          type: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        },
      };
    }
  }

  async getRunResults(collectionId: RQAPI.ApiClientRecord["collectionId"]): ResponsePromise<RunResult[]> {
    try {
      const collection = await this.getCollectionDetails(collectionId);

      if (!collection) {
        return {
          success: false,
          data: null,
          error: {
            type: "NOT_FOUND",
            message: "Collection not found!",
          },
        };
      }

      const runResults = collection.runResults || [];
      return {
        success: true,
        data: runResults,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          type: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        },
      };
    }
  }

  async addRunResult(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runResult: RunResult
  ): ResponsePromise<SavedRunResult> {
    try {
      const collection = await this.getCollectionDetails(collectionId);

      if (!collection) {
        return {
          success: false,
          data: null,
          error: {
            type: "NOT_FOUND",
            message: "Collection not found!",
          },
        };
      }

      const resultArray = Array.from(runResult.iterations.values());

      const runResultToSave = {
        id: this.getNewId(),
        ...runResult,
        iterations: resultArray,
      } as SavedRunResult;

      await this.updateRecord(
        {
          ...collection,
          runResults: [...(collection.runResults || []), runResultToSave],
        } as LocalStore.CollectionRecord,
        collection.id
      );

      return { success: true, data: runResultToSave };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          type: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        },
      };
    }
  }
}
