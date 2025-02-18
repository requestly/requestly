import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";
import { ApiClientLocalMeta, ApiClientRecordsInterface } from "../../interfaces";
import { RQAPI } from "features/apiClient/types";
import { FsManagerServiceAdapter, fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";

type Collection = {
  type: "collection";
  collectionId?: string;
  id: string;
  name: string;
  variables?: Record<string, any>;
};

type API = {
  type: "api";
  collectionId?: string;
  id: string;
  request: {
    name: string;
    url: string;
    method: string;
  };
};

type APIEntity = Collection | API;

export class LocalApiClientRecordsSync implements ApiClientRecordsInterface<ApiClientLocalMeta> {
  meta: ApiClientLocalMeta;
	fsManagerService: FsManagerServiceAdapter;

	constructor(readonly metadata: ApiClientLocalMeta) {
    this.meta = metadata;
  }

  private async getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.meta.rootPath);
  }

	private parseAPIEntities(entities: APIEntity[]): RQAPI.Record[] {
		return entities.map(e => {
			if (e.type === 'collection') {
				const collection: RQAPI.CollectionRecord = {
					id: e.id,
					collectionId: e.collectionId,
					name: e.name,

					ownerId: this.meta.rootPath,
					deleted: false,
					createdBy: 'local',
					updatedBy: 'local',
					createdTs: Date.now(),
					updatedTs: Date.now(),

					type: RQAPI.RecordType.COLLECTION,
					data: {
						variables: {},
					}
				}
				return collection;
			} else {
				const api: RQAPI.ApiRecord = {
					id: e.id,
					collectionId: e.collectionId,
					name: e.request.name,

					ownerId: this.meta.rootPath,
					deleted: false,
					createdBy: 'local',
					updatedBy: 'local',
					createdTs: Date.now(),
					updatedTs: Date.now(),

					type: RQAPI.RecordType.API,
					data: {
						request: {
							url: e.request.url,
					    queryParams: [],
					    method: e.request.method as RQAPI.Request['method'],
					    headers: [],
						},
					}
				}

				return api;
			}
		})
	}

  async getAllRecords(): RQAPI.RecordsPromise {
		const service = await this.getAdapter();
		const entities: APIEntity[] = await service.getAllRecords();
		const parsedRecords = this.parseAPIEntities(entities);
		return {
			success: true,
			data: parsedRecords,
		};
  }
  getRecord(_recordId: string): RQAPI.RecordPromise {
      throw new Error("Method not implemented.");
  }
  createRecord(_record: Partial<RQAPI.Record>): RQAPI.RecordPromise {
      throw new Error("Method not implemented.");
  }
  createRecordWithId(_record: Partial<RQAPI.Record>, _id: string): RQAPI.RecordPromise {
      throw new Error("Method not implemented.");
  }
  updateRecord(_record: Partial<RQAPI.Record>, _id?: string): RQAPI.RecordPromise {
      throw new Error("Method not implemented.");
  }
  deleteRecords(_recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string; }> {
      throw new Error("Method not implemented.");
  }
}
