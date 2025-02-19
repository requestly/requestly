// import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { API, Collection, FileSystemResult } from "features/apiClient/helpers/modules/sync/local/services/types";
import BackgroundServiceAdapter, { rpc } from "./DesktopBackgroundService";
// import FEATURES from "config/constants/sub/features";
export class FsManagerServiceAdapter extends BackgroundServiceAdapter {
  static NAMESPACE = "local_sync";
  constructor() {
    super(FsManagerServiceAdapter.NAMESPACE);
    // if (!isFeatureCompatible(FEATURES.LOCAL_FILE_SYNC)) {
    //   throw new Error("LocalFileSync is not supported in the current version of the app");
    // }
  }

  async build(rootPath: string) {
    return this.invokeProcedureInBG("build", rootPath) as Promise<void>;
  }

  async getAllRecords() {
    return this.invokeProcedureInBG("getAllRecords") as Promise<any>;
  }

  async getRecord(id: string) {
    return this.invokeProcedureInBG("getRecord", id) as Promise<any>;
  }

	async createRecord(record: API['request'], collectionId?: string, ) {
		return this.invokeProcedureInBG("createRecord", record, collectionId, ) as Promise<FileSystemResult<API>>;
	}

	async createRecordWithId(record: API['request'], id: string, ) {
		return this.invokeProcedureInBG("createRecordWithId", record, id ) as Promise<FileSystemResult<API>>;
	}

	async updateRecord(patch: Partial<API['request']>, id: string, ) {
		return this.invokeProcedureInBG("updateRecord", patch, id) as Promise<FileSystemResult<API>>;
	}

	async createCollection(name: string, collectionId?: string, ) {
		return this.invokeProcedureInBG("createCollection", name, collectionId) as Promise<FileSystemResult<Collection>>;
	}

  async getAllEnvironments() {
    return this.invokeProcedureInBG("getAllEnvironments") as Promise<any>;
  }
}

class FsManagerServiceAdapterProvider {
  private service: FsManagerServiceAdapter;

  async get(rootPath: string) {
    if (this.service) {
      return this.service;
    }

    const service = new FsManagerServiceAdapter();
    await service.build(rootPath);
    this.service = service;

    return service;
  }
}

export const fsManagerServiceAdapterProvider = new FsManagerServiceAdapterProvider();
export function createWorkspaceFolder(path: string) {
  return rpc(FsManagerServiceAdapter.NAMESPACE, "createWorkspaceFolder", path);
}
