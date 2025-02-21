import { ApiClientLocalMeta, ApiClientRecordsInterface } from "../../interfaces";
import { RQAPI } from "features/apiClient/types";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { API, APIEntity, FileSystemResult } from "./types";
import { parseFsId, parseNativeId } from "../../utils";
import { v4 as uuidv4 } from "uuid";

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

  private parseAPIEntities(entities: APIEntity[]): RQAPI.Record[] {
    return entities.map((e) => {
      if (e.type === "collection") {
        const collection: RQAPI.CollectionRecord = {
          id: parseFsId(e.id),
          collectionId: e.collectionId,
          name: e.name,

          ownerId: this.meta.rootPath,
          deleted: false,
          createdBy: "local",
          updatedBy: "local",
          createdTs: Date.now(),
          updatedTs: Date.now(),

          type: RQAPI.RecordType.COLLECTION,
          data: {
            variables: {},
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
          },
        };

        return api;
      }
    });
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
    const result: FileSystemResult<APIEntity[]> = await service.getAllRecords();
    if (result.type === "error") {
      return {
        success: false,
        data: [],
        message: result.error.message,
      };
    }
    const parsedRecords = this.parseAPIEntities(result.content);
    console.log("local fs parsing", parsedRecords);
    return {
      success: true,
      data: parsedRecords,
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

  async deleteRecords(recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string }> {
    const service = await this.getAdapter();
    const result = await service.deleteRecords(recordIds);

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
}
