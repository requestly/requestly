import { ApiClientInMemoryMeta, ApiClientLocalMeta, ApiClientRecordsInterface } from "../../interfaces";
import { RQAPI } from "features/apiClient/types";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { API, APIEntity, FileSystemResult, FileType } from "./types";
import { parseEntityVariables, parseFsId, parseNativeId } from "../../utils";
import { v4 as uuidv4 } from "uuid";
import { EnvironmentVariables } from "backend/environment/types";
import { Authorization } from "features/apiClient/screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/AuthConfig";

export class InMemoryApiClientRecordsSync implements ApiClientRecordsInterface<ApiClientInMemoryMeta> {
  private store;

  constructor(readonly meta: ApiClientInMemoryMeta) {
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

  private parseAPIEntities(entities: APIEntity[]): RQAPI.Record[] {
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
          name: e.request.name,

          ownerId: this.meta.rootPath,
          deleted: false,
          createdBy: "local",
          updatedBy: "local",
          createdTs: Date.now(),
          updatedTs: Date.now(),

          type: RQAPI.RecordType.API,
          data: {
            request: {
              url: e.request.url,
              queryParams: e.request.queryParams,
              method: e.request.method as RQAPI.Request["method"],
              headers: e.request.headers,
              body: e.request?.body,
              bodyContainer: e.request?.bodyContainer,
              contentType: e.request?.contentType,
            },
            scripts: e.request.scripts,
            auth: e.request.auth || {
              currentAuthType: Authorization.Type.NO_AUTH,
              authConfigStore: {},
            },
          },
        };

        return api;
      }
    });
  }

  generateApiRecordId(parentId?: string) {
    return uuidv4();
  }

  generateCollectionId(name: string, parentId?: string) {
    return uuidv4();
  }

  async getAllRecords(): RQAPI.RecordsPromise {
    return {
      success: true,
      data: {
        records: this.store,
        erroredRecords: [],
      },
    };
  }
  getRecordsForForceRefresh(): RQAPI.RecordsPromise | Promise<void> {
    return this.getAllRecords();
  }
  async getRecord(nativeId: string): RQAPI.RecordPromise {
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
  async createRecord(record: Partial<RQAPI.ApiRecord>): RQAPI.RecordPromise {
    if (record.id) {
      return this.createRecordWithId(record, record.id);
    }
    const service = await this.getAdapter();
    const result = await service.createRecord(
      {
        name: record.name || "Untitled Request",
        url: record.data.request.url,
        method: record.data.request.method,
        queryParams: record.data.request.queryParams,
        headers: record.data.request.headers,
        body: record.data.request?.body,
        bodyContainer: record.data.request?.bodyContainer,
        contentType: record.data.request?.contentType,
        scripts: record.data.scripts,
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

  async createCollection(record: Partial<Omit<RQAPI.CollectionRecord, "id">>): RQAPI.RecordPromise {
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

  async createRecordWithId(record: Partial<RQAPI.ApiRecord>, nativeId: string): RQAPI.RecordPromise {
    const id = parseNativeId(nativeId);
    const service = await this.getAdapter();
    const result = await service.createRecordWithId(
      {
        name: record.name || "Untitled Request",
        url: record.data.request.url,
        method: record.data.request.method,
        queryParams: record.data.request.queryParams,
        headers: record.data.request.headers,
        body: record.data.request?.body,
        bodyContainer: record.data.request?.bodyContainer,
        contentType: record.data.request?.contentType,
        scripts: record.data.scripts,
        auth: record.data.auth,
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
  async updateRecord(patch: Partial<Omit<RQAPI.ApiRecord, "id">>, nativeId: string): RQAPI.RecordPromise {
    const id = parseNativeId(nativeId);
    const service = await this.getAdapter();
    const result = await service.updateRecord(
      {
        name: patch.name,
        url: patch.data.request.url,
        method: patch.data.request.method,
        queryParams: patch.data.request.queryParams,
        headers: patch.data.request.headers,
        body: patch.data.request?.body,
        bodyContainer: patch.data.request?.bodyContainer,
        contentType: patch.data.request?.contentType,
        scripts: patch.data.scripts,
        auth: patch.data.auth,
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

  async getCollection(recordId: string): RQAPI.RecordPromise {
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

  async renameCollection(id: string, newName: string): RQAPI.RecordPromise {
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
  ): Promise<{ success: boolean; data: RQAPI.Record; message?: string }> {
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
  ): Promise<{ success: boolean; data: RQAPI.Record; message?: string }> {
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
    const service = await this.getAdapter();
    const result: RQAPI.Record[] = [];
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
}
