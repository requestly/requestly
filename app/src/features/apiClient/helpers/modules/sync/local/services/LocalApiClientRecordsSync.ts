import { ApiClientLocalMeta, ApiClientRecordsInterface, ResultPromise } from "../../interfaces";
import { RQAPI } from "features/apiClient/types";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { API, APIEntity, ApiRequestDetails, FileSystemResult, FileType } from "./types";
import { parseEntityVariables, parseFsId, parseNativeId } from "../../utils";
import { v4 as uuidv4 } from "uuid";
import { EnvironmentVariables } from "backend/environment/types";
import { Authorization } from "features/apiClient/screens/apiClient/components/views/components/request/components/AuthorizationView/types/AuthConfig";

export class LocalApiClientRecordsSync implements ApiClientRecordsInterface<ApiClientLocalMeta> {
  meta: ApiClientLocalMeta;

  constructor(readonly metadata: ApiClientLocalMeta) {
    this.meta = metadata;
  }

  private async getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.meta.rootPath);
  }

  private generateFileName() {
    return `${uuidv4()}.json`;
  }

  private getNormalizedPath(path: string) {
    const normalizedPath = path.endsWith("/") ? path : `${path}/`;
    return normalizedPath;
  }

  private appendPath(basePath: string, resourcePath: string) {
    const separator = basePath.endsWith("/") ? "" : "/";
    return `${basePath}${separator}${resourcePath}`;
  }

  private parseApiRequestDetails(requestDetails: ApiRequestDetails): RQAPI.Request {
    switch (requestDetails.type) {
      case "http":
        return {
          url: requestDetails.url,
          queryParams: requestDetails.queryParams,
          method: requestDetails.method as RQAPI.HttpRequest["method"],
          headers: requestDetails.headers,
          body: requestDetails.body,
          bodyContainer: requestDetails.bodyContainer,
          contentType: requestDetails.contentType,
        };
      case "graphql":
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
          collectionId: e.collectionId,
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
          collectionId: e.collectionId,
          name: e.data.name,
          ownerId: this.meta.rootPath,
          deleted: false,
          createdBy: "local",
          updatedBy: "local",
          createdTs: Date.now(),
          updatedTs: Date.now(),

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
    switch (record.data.type) {
      case RQAPI.ApiEntryType.HTTP:
        return {
          name: record.name || "Untitled Request",
          request: {
            type: record.data.type,
            url: record.data.request.url,
            scripts: record.data.scripts,
            method: record.data.request.method,
            queryParams: record.data.request.queryParams,
            headers: record.data.request.headers,
            body: record.data.request?.body,
            bodyContainer: record.data.request?.bodyContainer,
            contentType: record.data.request?.contentType,
            auth: record.data.auth,
          },
        };
      case RQAPI.ApiEntryType.GRAPHQL:
        return {
          name: record.name || "Untitled Request",
          request: {
            type: record.data.type,
            url: record.data.request.url,
            scripts: record.data.scripts,
            operation: record.data.request.operation,
            variables: record.data.request.variables,
            operationName: record.data.request.operationName,
            headers: record.data.request.headers,
            auth: record.data.auth,
          },
        };
    }
  }

  generateApiRecordId(parentId?: string) {
    const name = this.generateFileName();
    return parseFsId(this.appendPath(parentId || this.meta.rootPath, name));
  }

  generateCollectionId(name: string, parentId?: string) {
    const path = this.appendPath(parentId || this.meta.rootPath, name);
    return parseFsId(this.getNormalizedPath(path));
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
      record.collectionId
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
    const result = await service.createCollection(record.name, record.collectionId);

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
      id
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
  async updateRecord(patch: Partial<Omit<RQAPI.ApiRecord, "id">>, nativeId: string): RQAPI.ApiClientRecordPromise {
    const id = parseNativeId(nativeId);
    const service = await this.getAdapter();
    const result = await service.updateRecord(
      {
        ...this.parseApiRecordRequest(patch),
        name: patch.name,
      },
      id
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
        data: undefined,
        message: result.error.message,
      };
    }
    return {
      success: true,
      data: result.content,
    };
  }

  async updateCollectionAuthData(
    collection: RQAPI.CollectionRecord
  ): Promise<{ success: boolean; data: RQAPI.ApiClientRecord; message?: string }> {
    const service = await this.getAdapter();
    const result = await service.updateCollectionAuthData(collection.id, collection.data.auth);

    if (result.type === "error") {
      return {
        success: false,
        data: undefined,
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

  async getRawFileData(id: string): Promise<{ success: boolean; data: unknown; message?: string }> {
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

  async createCollectionFromImport(
    collection: RQAPI.CollectionRecord,
    id: string
  ): Promise<{ success: boolean; data: RQAPI.ApiClientRecord; message?: string }> {
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

  async getRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfigId: RQAPI.RunConfig["id"]
  ): ResultPromise<RQAPI.RunConfig> {
    return {
      success: false,
      data: null,
      message: "Not implemented",
    };
  }

  async updateRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfigId: RQAPI.RunConfig["id"],
    runConfig: Partial<RQAPI.RunConfig>
  ): ResultPromise<boolean> {
    return {
      success: false,
      data: null,
      message: "Not implemented",
    };
  }
}
