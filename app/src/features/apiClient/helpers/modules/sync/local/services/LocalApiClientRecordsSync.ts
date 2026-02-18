import { ApiClientLocalMeta, ApiClientRecordsInterface } from "../../interfaces";
import { RQAPI } from "features/apiClient/types";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { API, APIEntity, ApiRequestDetails, FileSystemResult, FileType } from "./types";
import { parseEntityVariables, parseFsId, parseNativeId } from "../../utils";
import { v4 as uuidv4 } from "uuid";
import { EnvironmentVariables } from "backend/environment/types";
import { Authorization } from "features/apiClient/screens/apiClient/components/views/components/request/components/AuthorizationView/types/AuthConfig";
import { ResponsePromise } from "backend/types";
import { SavedRunConfig } from "features/apiClient/slices/runConfig/types";
import { RunResult, SavedRunResult } from "features/apiClient/slices/common/runResults";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";

export class LocalApiClientRecordsSync implements ApiClientRecordsInterface<ApiClientLocalMeta> {
  meta: ApiClientLocalMeta;

  constructor(readonly metadata: ApiClientLocalMeta) {
    this.meta = metadata;
  }

  private async getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.meta.rootPath);
  }

  private parseApiRequestDetails(requestDetails: ApiRequestDetails): RQAPI.Request {
    switch (requestDetails.type) {
      case RQAPI.ApiEntryType.HTTP:
        return {
          url: requestDetails.url,
          queryParams: requestDetails.queryParams,
          method: requestDetails.method as RQAPI.HttpRequest["method"],
          headers: requestDetails.headers,
          body: requestDetails.body,
          bodyContainer: requestDetails.bodyContainer,
          contentType: requestDetails.contentType,
          pathVariables: requestDetails.pathVariables,
        };
      case RQAPI.ApiEntryType.GRAPHQL:
        return {
          operation: requestDetails.operation,
          variables: requestDetails.variables,
          operationName: requestDetails.operationName,
          headers: requestDetails.headers,
          url: requestDetails.url,
        };
    }
  }

  private parseAPIEntities(entities: APIEntity[]): RQAPI.ApiClientRecord[] {
    return entities.map((e) => {
      if (e.type === "collection") {
        const collection: RQAPI.CollectionRecord = {
          id: parseFsId(e.id),
          collectionId: e.collectionId ?? null,
          name: e.name,
          description: e.description || "",
          ownerId: this.meta.rootPath,
          deleted: false,
          createdBy: "local",
          updatedBy: "local",
          createdTs: Date.now(),
          updatedTs: Date.now(),

          type: RQAPI.RecordType.COLLECTION,
          data: {
            variables: parseEntityVariables(e.variables || {}),
            auth: e.auth || {
              currentAuthType: Authorization.Type.NO_AUTH,
              authConfigStore: {},
            },
          },
        };
        return collection;
      } else {
        const api: RQAPI.ApiRecord = {
          id: parseFsId(e.id),
          collectionId: e.collectionId ?? null,
          name: e.data.name,
          ownerId: this.meta.rootPath,
          deleted: false,
          createdBy: "local",
          updatedBy: "local",
          createdTs: Date.now(),
          updatedTs: Date.now(),
          rank: e.data.rank,

          type: RQAPI.RecordType.API,
          data: {
            type: e.data.request.type,
            request: this.parseApiRequestDetails(e.data.request),
            scripts: e.data.request.scripts,
            auth: e.data.request.auth || {
              currentAuthType: Authorization.Type.NO_AUTH,
              authConfigStore: {},
            },
            response: null,
            testResults: [],
          } as RQAPI.ApiEntry,
        };

        return api;
      }
    });
  }

  private parseApiRecordRequest(record: Partial<RQAPI.ApiRecord>): API["data"] {
    switch (record.data?.type) {
      case RQAPI.ApiEntryType.HTTP:
        return {
          name: record.name || "Untitled request",
          rank: record.rank,
          request: {
            type: record.data.type,
            url: record.data.request.url,
            scripts: record.data.scripts ?? { postResponse: "", preRequest: "" },
            method: record.data.request.method,
            queryParams: record.data.request.queryParams,
            headers: record.data.request.headers,
            body: record.data.request?.body,
            bodyContainer: record.data.request?.bodyContainer, // should be present Partial type is wrongly used
            contentType: record.data.request?.contentType,
            auth: record.data.auth,
            pathVariables: record.data.request?.pathVariables,
          },
        };
      case RQAPI.ApiEntryType.GRAPHQL:
        return {
          name: record.name || "Untitled request",
          rank: record.rank,
          request: {
            type: record.data.type,
            url: record.data.request.url,
            scripts: record.data.scripts ?? { postResponse: "", preRequest: "" },
            operation: record.data.request.operation,
            variables: record.data.request.variables,
            operationName: record.data.request.operationName,
            headers: record.data.request.headers,
            auth: record.data.auth,
          },
        };
      default: {
        const httpRecord = record as RQAPI.HttpApiRecord;
        return {
          name: record.name || "Untitled Request",
          rank: record.rank,
          request: {
            type: httpRecord.data.type,
            url: httpRecord.data.request.url,
            scripts: httpRecord.data.scripts ?? { postResponse: "", preRequest: "" },
            method: httpRecord.data.request.method,
            queryParams: httpRecord.data.request.queryParams,
            headers: httpRecord.data.request.headers,
            body: httpRecord.data.request?.body,
            bodyContainer: httpRecord.data.request?.bodyContainer,
            contentType: httpRecord.data.request?.contentType,
            auth: httpRecord.data.auth,
            pathVariables: httpRecord.data.request?.pathVariables,
          },
        };
      }
    }
  }

  generateApiRecordId() {
    return uuidv4();
  }

  generateCollectionId() {
    return uuidv4();
  }

  async getAllRecords(): RQAPI.RecordsPromise {
    const service = await this.getAdapter();
    const result = await service.getAllRecords();
    if (result.type === "error") {
      return {
        success: false,
        data: {
          records: [],
          erroredRecords: [],
        },
        message: `Error: ${result.error.message} in ${result.error.path}`,
      };
    }
    const parsedRecords = this.parseAPIEntities(result.content.records);
    return {
      success: true,
      data: {
        records: parsedRecords,
        erroredRecords: result.content.erroredRecords || [],
      },
    };
  }
  getRecordsForForceRefresh(): RQAPI.RecordsPromise | Promise<void> {
    return this.getAllRecords();
  }
  async getRecord(nativeId: string): RQAPI.ApiClientRecordPromise {
    const id = parseNativeId(nativeId);
    const service = await this.getAdapter();
    const result: FileSystemResult<API> = await service.getRecord(id);
    if (result.type === "error") {
      return {
        success: false,
        data: null,
        message: result.error.message,
      };
    }
    const parsedRecords = this.parseAPIEntities([result.content]);
    return {
      success: true,
      data: parsedRecords[0],
    };
  }
  async createRecord(record: Partial<RQAPI.ApiRecord>): RQAPI.ApiClientRecordPromise {
    if (record.id) {
      return this.createRecordWithId(record, record.id);
    }
    const service = await this.getAdapter();
    const result = await service.createRecord(
      {
        ...this.parseApiRecordRequest(record),
      },
      record.collectionId ?? null
    );

    if (result.type === "error") {
      return {
        success: false,
        data: null,
        message: result.error.message,
      };
    }

    const [parsedApiRecord] = this.parseAPIEntities([result.content]);
    return {
      success: true,
      data: parsedApiRecord,
    };
  }

  async createCollection(record: Partial<Omit<RQAPI.CollectionRecord, "id">>): RQAPI.ApiClientRecordPromise {
    const service = await this.getAdapter();
    const result = await service.createCollection(record.name ?? "Untitled Collection", record.collectionId);

    if (result.type === "error") {
      const message = result.error.message;
      const doesFolderAlreadyExists = message === "Folder already exists!";
      return {
        success: false,
        data: null,
        message: doesFolderAlreadyExists
          ? `${result.error.message} Please rename the collection with name "${record.name}"`
          : message,
      };
    }

    const [parsedApiRecord] = this.parseAPIEntities([result.content]);
    return {
      success: true,
      data: parsedApiRecord,
    };
  }

  async createRecordWithId(record: Partial<RQAPI.ApiRecord>, nativeId: string): RQAPI.ApiClientRecordPromise {
    const id = parseNativeId(nativeId);
    const service = await this.getAdapter();
    const result = await service.createRecordWithId(
      {
        ...this.parseApiRecordRequest(record),
      },
      id,
      record.collectionId ?? null
    );

    if (result.type === "error") {
      throw new Error(result.error.message);
    }

    const [parsedApiRecord] = this.parseAPIEntities([result.content]);
    return {
      success: true,
      data: parsedApiRecord,
    };
  }
  async updateRecord(
    patch: Partial<Omit<RQAPI.ApiClientRecord, "id">>,
    nativeId: string
  ): RQAPI.ApiClientRecordPromise {
    const id = parseNativeId(nativeId);
    if (!patch.rank) {
      const existingRecord = await this.getRecord(id);
      if (existingRecord?.success && existingRecord.data) {
        patch.rank = apiRecordsRankingManager.getEffectiveRank(existingRecord.data);
      }
    }
    const isCollection = patch.type === RQAPI.RecordType.COLLECTION;
    if (isCollection) {
      return this.updateCollectionRecord(patch as Partial<Omit<RQAPI.CollectionRecord, "id">>, id);
    }

    // Handle API record updates
    const service = await this.getAdapter();
    const result = await service.updateRecord(
      {
        ...this.parseApiRecordRequest(patch as Partial<RQAPI.ApiRecord>),
        name: patch.name,
      },
      id
    );

    if (result.type === "error") {
      throw new Error(result.error.message);
    }

    const [parsedApiRecord] = this.parseAPIEntities([result.content]);
    if (!parsedApiRecord) {
      return {
        success: false,
        data: null,
        message: "Failed to parse API record",
      };
    }
    return {
      success: true,
      data: parsedApiRecord,
    };
  }

  private async updateCollectionRecord(
    patch: Partial<Omit<RQAPI.CollectionRecord, "id">>,
    id: string
  ): RQAPI.ApiClientRecordPromise {
    const service = await this.getAdapter();

    const currentCollectionResult = await service.getCollection(id);
    if (currentCollectionResult.type === "error") {
      return {
        success: false,
        data: null,
        message: currentCollectionResult.error.message,
      };
    }

    const [currentCollection] = this.parseAPIEntities([currentCollectionResult.content]);
    const currentCollectionRecord = currentCollection as RQAPI.CollectionRecord;

    // Update name if provided
    if ("name" in patch && patch.name !== undefined && patch.name !== currentCollectionRecord.name) {
      const renameResult = await service.renameCollection(id, patch.name);
      if (renameResult.type === "error") {
        return {
          success: false,
          data: null,
          message: renameResult.error.message,
        };
      }

      const [renamedCollection] = this.parseAPIEntities([renameResult.content]);
      Object.assign(currentCollectionRecord, renamedCollection);
    }

    // Update description if provided
    if (
      "description" in patch &&
      patch.description !== undefined &&
      patch.description !== currentCollectionRecord.description
    ) {
      const descriptionResult = await service.updateCollectionDescription(id, patch.description);
      if (descriptionResult.type === "error") {
        return {
          success: false,
          data: null,
          message: descriptionResult.error.message,
        };
      }
      currentCollectionRecord.description = descriptionResult.content;
    }

    // Update variables if provided
    if (patch.data?.variables !== undefined) {
      const variablesResult = await service.setCollectionVariables(id, patch.data.variables);
      if (variablesResult.type === "error") {
        return {
          success: false,
          data: null,
          message: variablesResult.error.message,
        };
      }
      if (variablesResult.type === "success") {
        currentCollectionRecord.data.variables = variablesResult.data;
      }
    }

    // Update auth if provided
    if (patch.data?.auth !== undefined) {
      const authResult = await service.updateCollectionAuthData(id, patch.data.auth);
      if (authResult.type === "error") {
        return {
          success: false,
          data: null,
          message: authResult.error.message,
        };
      }
      currentCollectionRecord.data.auth = authResult.content;
    }

    return {
      success: true,
      data: currentCollectionRecord,
    };
  }

  async deleteRecords(recordIds: string[]) {
    const service = await this.getAdapter();
    const result = await service.deleteRecords(recordIds);

    if (result.type === "error") {
      return {
        success: false,
        message: result.error.message,
      };
    }

    return {
      success: true,
    };
  }

  async getCollection(recordId: string): RQAPI.ApiClientRecordPromise {
    const service = await this.getAdapter();
    const result = await service.getCollection(recordId);
    if (result.type === "error") {
      return {
        success: false,
        data: null,
        message: result.error.message,
      };
    }
    const parsedRecords = this.parseAPIEntities([result.content]);
    return {
      success: true,
      data: parsedRecords[0],
    };
  }

  async renameCollection(id: string, newName: string): RQAPI.ApiClientRecordPromise {
    const service = await this.getAdapter();
    const result = await service.renameCollection(id, newName);
    if (result.type === "error") {
      return {
        success: false,
        data: null,
        message: result.error.message,
      };
    }
    const parsedRecords = this.parseAPIEntities([result.content]);
    return {
      success: true,
      data: parsedRecords[0],
    };
  }

  async deleteCollections(ids: string[]): Promise<{ success: boolean; data: unknown; message?: string }> {
    const service = await this.getAdapter();
    const result = await service.deleteCollections(ids);
    if (result.type === "error") {
      return {
        success: false,
        data: undefined,
        message: result.error.message,
      };
    }
    return {
      success: true,
      data: undefined,
    };
  }

  async setCollectionVariables(
    id: string,
    variables: EnvironmentVariables
  ): Promise<{ success: boolean; data: unknown; message?: string }> {
    const service = await this.getAdapter();
    const result = await service.setCollectionVariables(id, variables);
    if (result.type === "error") {
      return {
        success: false,
        data: undefined,
        message: result.error.message,
      };
    }
    return {
      success: true,
      data: result.content,
    };
  }

  async updateCollectionDescription(
    id: string,
    description: string
  ): Promise<{ success: boolean; data: string; message?: string }> {
    const service = await this.getAdapter();
    const result = await service.updateCollectionDescription(id, description);

    if (result.type === "error") {
      return {
        success: false,
        data: "",
        message: result.error.message,
      };
    }

    return {
      success: true,
      data: result.content,
    };
  }

  async updateCollectionAuthData(collection: RQAPI.CollectionRecord): RQAPI.ApiClientRecordPromise {
    const service = await this.getAdapter();
    const result = await service.updateCollectionAuthData(collection.id, collection.data.auth);

    if (result.type === "error") {
      return {
        success: false,
        data: null,
        message: result.error.message,
      };
    }
    const updatedCollection: RQAPI.CollectionRecord = {
      ...collection,
      data: {
        ...collection.data,
        auth: result.content,
      },
    };
    return {
      success: true,
      data: updatedCollection,
    };
  }

  async writeToRawFile(
    id: string,
    record: any,
    fileType: FileType
  ): Promise<{ success: boolean; data: unknown; message?: string }> {
    const service = await this.getAdapter();
    const result = await service.writeRawRecord(id, record, fileType);
    if (result.type === "error") {
      return {
        success: false,
        data: null,
        message: result.error.message,
      };
    }
    return {
      success: true,
      data: result.content,
    };
  }

  async getRawFileData(id: string): Promise<{ success: boolean; data: string | null; message?: string }> {
    const service = await this.getAdapter();
    const result = await service.getRawFileData(id);
    if (result.type === "error") {
      return {
        success: false,
        data: null,
        message: result.error.message,
      };
    }
    return {
      success: true,
      data: result.content,
    };
  }

  async createCollectionFromImport(collection: RQAPI.CollectionRecord, id: string): RQAPI.ApiClientRecordPromise {
    const service = await this.getAdapter();
    const result = await service.createCollectionFromCompleteRecord(collection, id);
    if (result.type === "error") {
      return {
        success: false,
        data: null,
        message: result.error.message,
      };
    }
    const [parsedRecords] = this.parseAPIEntities([result.content as APIEntity]);
    return {
      success: true,
      data: parsedRecords,
    };
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
    try {
      for (const record of records) {
        await this.createRecordWithId(record, record.id);
      }
      return records;
    } catch (error) {
      throw new Error(error.message);
    }
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
    const service = await this.getAdapter();
    const result: RQAPI.ApiClientRecord[] = [];

    for (const entity of entities) {
      const moveResult = await (async () => {
        if (entity.type === RQAPI.RecordType.API) {
          return service.moveRecord(entity.id, newParentId);
        }
        return service.moveCollection(entity.id, newParentId);
      })();

      if (moveResult.type === "success") {
        const parsedCollection = this.parseAPIEntities([moveResult.content as APIEntity]);
        result.push(parsedCollection[0]);
      }
    }

    return result;
  }

  async batchCreateRecordsWithExistingId(entities: RQAPI.ApiClientRecord[]): RQAPI.RecordsPromise {
    if (entities.length === 0) {
      return {
        success: true,
        data: { records: [], erroredRecords: [] },
      };
    }

    const result: RQAPI.ApiClientRecord[] = [];

    for (const entity of entities) {
      const createResult = await (async () => {
        if (entity.type === RQAPI.RecordType.API) {
          return this.createRecordWithId(entity, entity.id);
        }

        return this.createCollectionFromImport(entity, entity.id);
      })();

      if (createResult.success) {
        result.push(createResult.data);
      }
    }

    return {
      success: true,
      data: { records: result, erroredRecords: [] },
    };
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

  async getRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfigId: RQAPI.RunConfig["id"]
  ): ResponsePromise<SavedRunConfig> {
    return {
      success: true,
      data: {
        id: runConfigId,
        runOrder: [],
        delay: 0,
        iterations: 1,
        dataFile: null,
      },
    };
  }

  async upsertRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfig: Partial<RQAPI.RunConfig>
  ): ResponsePromise<SavedRunConfig> {
    return {
      success: false,
      data: null,
      error: {
        type: "INTERNAL_SERVER_ERROR",
        message: "Not implemented",
      },
    };
  }

  async getRunResults(collectionId: RQAPI.ApiClientRecord["collectionId"]): ResponsePromise<RunResult[]> {
    return {
      success: true,
      data: [],
    };
  }

  async addRunResult(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runResult: RunResult
  ): ResponsePromise<SavedRunResult> {
    return {
      success: true,
      data: {} as SavedRunResult,
    };
  }

  async getAllExamples(
    recordIds: string[]
  ): Promise<{ success: boolean; data: { examples: RQAPI.ExampleApiRecord[]; failedRecordIds?: string[] } }> {
    // TODO: Implement this, will be a dummy implementation for local ws
    return {
      success: true,
      data: {
        examples: [],
        failedRecordIds: [],
      },
    };
  }

  async createExampleRequest(parentRequestId: string, example: RQAPI.ExampleApiRecord): RQAPI.ApiClientRecordPromise {
    return {
      success: true,
      data: example,
    };
  }
  async updateExampleRequest(example: RQAPI.ExampleApiRecord): RQAPI.ApiClientRecordPromise {
    return {
      success: true,
      data: example,
    };
  }

  async deleteExamples(exampleRecords: RQAPI.ExampleApiRecord[]): Promise<{ success: boolean; message?: string }> {
    return {
      success: true,
      message: "Not implemented",
    };
  }
}
