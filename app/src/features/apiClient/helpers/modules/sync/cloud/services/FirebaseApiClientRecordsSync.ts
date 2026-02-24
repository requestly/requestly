import {
  deleteApiRecords,
  getApiRecord,
  getApiRecords,
  upsertApiRecord,
  batchCreateApiRecordsWithExistingId,
  batchUpsertApiRecords,
  getExamplesForApiRecords,
  getRunConfig as getRunConfigFromFirebase,
  upsertRunConfig as upsertRunConfigFromFirebase,
  getRunResults as getRunResultsFromFirebase,
  addRunResult as addRunResultToFirebase,
  createExample,
} from "backend/apiClient";
import { ApiClientCloudMeta, ApiClientRecordsInterface } from "../../interfaces";
import { batchWrite, firebaseBatchWrite, generateDocumentId, getOwnerId } from "backend/utils";
import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { omit } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { sanitizeRecord, updateApiRecord } from "backend/apiClient/upsertApiRecord";
import { EnvironmentVariables } from "backend/environment/types";
import { ErroredRecord } from "../../local/services/types";
import { ResponsePromise } from "backend/types";
import { batchCreateCollectionRunDetailsInFirebase } from "backend/apiClient/batchCreateCollectionRunDetailsInFirebase";
import { RunResult, SavedRunResult } from "features/apiClient/slices/common/runResults";
import { SavedRunConfig } from "features/apiClient/slices/runConfig/types";
import { SentryCustomSpan } from "utils/sentry";
import { captureException } from "backend/apiClient/utils";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";
import { updateExample } from "backend/apiClient/updateExample";

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

  async getRecordsForForceRefresh(): Promise<void> {
    return;
  }

  async getRecord(recordId: string) {
    return getApiRecord(recordId);
  }

  async getCollection(recordId: string) {
    return getApiRecord(recordId);
  }

  async renameCollection(id: string, newName: string): RQAPI.ApiClientRecordPromise {
    return this.updateRecord({ id, name: newName }, id, RQAPI.RecordType.COLLECTION);
  }

  @SentryCustomSpan({
    name: "api_client.cloud.repository.createRecord",
    op: "repository.create",
    attributes: {
      "_attribute.repo_type": "cloud",
    },
  })
  async createRecord(record: Partial<RQAPI.ApiClientRecord>) {
    return await upsertApiRecord(this.meta.uid, record, this.meta.teamId);
  }

  async createCollection(record: Partial<RQAPI.ApiClientRecord>) {
    return this.createRecord(record);
  }

  async createRecordWithId(record: Partial<RQAPI.ApiClientRecord>, id: string) {
    return await upsertApiRecord(this.meta.uid, record, this.meta.teamId, id);
  }

  @SentryCustomSpan({
    name: "api_client.cloud.repository.updateRecord",
    op: "repository.update",
    attributes: {
      "_attribute.repo_type": "cloud",
    },
  })
  async updateRecord(record: Partial<RQAPI.ApiClientRecord>, id: string, type?: RQAPI.ApiClientRecord["type"]) {
    if (!record.rank) {
      const existingRecord = await this.getRecord(id);
      if (existingRecord?.success && existingRecord.data) {
        record.rank = apiRecordsRankingManager.getEffectiveRank(existingRecord.data);
      }
    }
    const sanitizedRecord = sanitizeRecord(record as RQAPI.ApiClientRecord);
    sanitizedRecord.id = id;
    if (type) {
      sanitizedRecord.type = type;
    }
    return await updateApiRecord(this.meta.uid, sanitizedRecord, this.meta.teamId);
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

    const variablesToSet: EnvironmentVariables = Object.fromEntries(
      Object.entries(variables).map(([key, value]) => [
        key,
        { syncValue: value.syncValue, type: value.type, id: value.id, isPersisted: true },
      ])
    );
    const collectionRecord: RQAPI.CollectionRecord = record.data as RQAPI.CollectionRecord;

    const updatedRecord: RQAPI.CollectionRecord = {
      ...collectionRecord,
      type: RQAPI.RecordType.COLLECTION,
      data: {
        ...collectionRecord.data,
        variables: variablesToSet,
      },
    };

    return this.updateRecord(updatedRecord, updatedRecord.id);
  }

  async updateCollectionDescription(
    id: string,
    description: string
  ): Promise<{ success: boolean; data: string; message?: string }> {
    const result = await this.updateRecord({ id, description }, id);

    if (result.success) {
      return {
        success: true,
        data: result.data.description || "",
      };
    }

    return {
      success: result.success,
      data: "",
      message: "Something went wrong while updating collection description",
    };
  }

  async updateCollectionAuthData(collection: RQAPI.CollectionRecord): RQAPI.ApiClientRecordPromise {
    return this.updateRecord(collection, collection.id);
  }

  async writeToRawFile(): RQAPI.ApiClientRecordPromise {
    return {
      success: true,
      data: {} as RQAPI.ApiClientRecord,
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

  // TODO: remove this
  async batchWriteApiEntities(
    batchSize: number,
    entities: RQAPI.ApiClientRecord[],
    writeFunction: (entity: RQAPI.ApiClientRecord) => Promise<any>
  ) {
    try {
      const result = await batchWrite(batchSize, entities, writeFunction);
      result.forEach((r) => {
        if (r.status === "rejected") {
          const error = r.reason;
          captureException(error);
        }
      });
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

  async batchWriteApiRecords(records: RQAPI.ApiRecord[]): Promise<RQAPI.ApiRecord[]> {
    const result = await batchUpsertApiRecords(this.meta.uid, records as RQAPI.ApiClientRecord[], this.meta.teamId);
    return result.success ? (result.data as RQAPI.ApiRecord[]) : [];
  }

  async duplicateApiEntities(entities: RQAPI.ApiClientRecord[]) {
    return firebaseBatchWrite("apis", entities);
  }

  async moveAPIEntities(entities: RQAPI.ApiClientRecord[], newParentId: string) {
    const updatedRequests = entities.map((record) =>
      isApiCollection(record)
        ? { ...record, collectionId: newParentId, data: omit(record.data, "children") }
        : { ...record, collectionId: newParentId }
    );
    return await firebaseBatchWrite("apis", updatedRequests);
  }

  async batchCreateRecordsWithExistingId(records: RQAPI.ApiClientRecord[]): RQAPI.RecordsPromise {
    if (records.length === 0) {
      return {
        success: true,
        data: { records: [], erroredRecords: [] },
      };
    }

    return await batchCreateApiRecordsWithExistingId(this.meta.uid, this.meta.teamId, records);
  }

  async batchCreateCollectionRunDetails(
    details: {
      collectionId: RQAPI.CollectionRecord["id"];
      runConfigs?: Record<string, SavedRunConfig>;
      runResults?: RunResult[];
    }[]
  ): RQAPI.RecordsPromise {
    if (details.length === 0) {
      return {
        success: true,
        data: { records: [], erroredRecords: [] },
      };
    }

    return batchCreateCollectionRunDetailsInFirebase(details);
  }

  async getRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfigId: RQAPI.RunConfig["id"]
  ): ResponsePromise<SavedRunConfig> {
    const result = await getRunConfigFromFirebase(collectionId, runConfigId);
    return result;
  }

  async upsertRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfig: SavedRunConfig
  ): ResponsePromise<SavedRunConfig> {
    const result = await upsertRunConfigFromFirebase(collectionId, runConfig);
    return result;
  }

  async getRunResults(collectionId: RQAPI.ApiClientRecord["collectionId"]): ResponsePromise<RunResult[]> {
    const result = await getRunResultsFromFirebase(collectionId);
    return result;
  }

  async addRunResult(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runResult: RunResult
  ): ResponsePromise<SavedRunResult> {
    const result = await addRunResultToFirebase(collectionId, runResult);
    return result;
  }

  async getAllExamples(
    recordIds: string[]
  ): Promise<{ success: boolean; data: { examples: RQAPI.ExampleApiRecord[]; failedRecordIds?: string[] } }> {
    const result = await getExamplesForApiRecords(this.getPrimaryId(), recordIds);

    if (!result.success) {
      return {
        success: false,
        data: {
          examples: [],
        },
      };
    }

    return {
      success: true,
      data: {
        examples: result.data,
        failedRecordIds: result.failedRecordIds,
      },
    };
  }

  async createExampleRequest(parentRequestId: string, example: RQAPI.ExampleApiRecord): RQAPI.ApiClientRecordPromise {
    const result = await createExample(this.meta.uid, parentRequestId, example, this.meta.teamId);
    return result;
  }

  async updateExampleRequest(example: RQAPI.ExampleApiRecord): RQAPI.ApiClientRecordPromise {
    const result = await updateExample(this.meta.uid, example, this.meta.teamId);
    return result;
  }
}
