import { ApiClientLocalMeta, ApiClientRecordsInterface } from "../../interfaces";
import { RQAPI } from "features/apiClient/types";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { API, APIEntity, FileSystemResult } from "./types";
import { parseFsId, parseNativeId } from "../../utils";

export class LocalApiClientRecordsSync implements ApiClientRecordsInterface<ApiClientLocalMeta> {
  meta: ApiClientLocalMeta;

  constructor(readonly metadata: ApiClientLocalMeta) {
    this.meta = metadata;
  }

  private async getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.meta.rootPath);
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
              queryParams: [],
              method: e.request.method as RQAPI.Request["method"],
              headers: [],
            },
          },
        };

        return api;
      }
    });
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
		console.log('local fs parsing', parsedRecords);
    return {
      success: true,
      data: parsedRecords,
    };
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
	async createRecord(record: Partial<Omit<RQAPI.ApiRecord, 'id'>>): RQAPI.RecordPromise {
    const service = await this.getAdapter();
		const result = await service.createRecord({
			name: record.name || "Untitled Request",
			url: record.data.request.url,
			method: record.data.request.method,
		}, record.collectionId);

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

  async createCollection(record: Partial<Omit<RQAPI.CollectionRecord, 'id'>>): RQAPI.RecordPromise {
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

  createRecordWithId(_record: Partial<RQAPI.Record>, _id: string): RQAPI.RecordPromise {
    throw new Error("Method not implemented.");
  }
  updateRecord(_record: Partial<RQAPI.Record>, _id?: string): RQAPI.RecordPromise {
    throw new Error("Method not implemented.");
  }
  deleteRecords(_recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string }> {
    throw new Error("Method not implemented.");
  }
}
