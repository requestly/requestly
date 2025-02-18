import { ApiClientLocalMeta, ApiClientRecordsInterface } from "../../interfaces";
import { RQAPI } from "features/apiClient/types";
import { FsManagerServiceAdapter, fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";

export class LocalApiClientRecordsSync implements ApiClientRecordsInterface<ApiClientLocalMeta> {
  meta: ApiClientLocalMeta;
	fsManagerService: FsManagerServiceAdapter;

	constructor(readonly metadata: ApiClientLocalMeta) {
    this.meta = metadata;
  }

  private async getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.meta.rootPath);
  }

  async getAllRecords(): RQAPI.RecordsPromise {
		const service = await this.getAdapter();
		// const records = await service.getAllRecords();
		console.log('csccd', service);
		return {
			success: true,
			data: [],
		};
  }
  getRecord(recordId: string): RQAPI.RecordPromise {
      throw new Error("Method not implemented.");
  }
  createRecord(record: Partial<RQAPI.Record>): RQAPI.RecordPromise {
      throw new Error("Method not implemented.");
  }
  createRecordWithId(record: Partial<RQAPI.Record>, id: string): RQAPI.RecordPromise {
      throw new Error("Method not implemented.");
  }
  updateRecord(record: Partial<RQAPI.Record>, id?: string): RQAPI.RecordPromise {
      throw new Error("Method not implemented.");
  }
  deleteRecords(recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string; }> {
      throw new Error("Method not implemented.");
  }
}
