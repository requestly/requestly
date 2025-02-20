// import { isFeatureCompatible } from "utils/CompatibilityUtils";
import {
  API,
  Collection,
  EnvironmentEntity,
  FileSystemResult,
} from "features/apiClient/helpers/modules/sync/local/services/types";
import BackgroundServiceAdapter, { rpc } from "./DesktopBackgroundService";
import { EnvironmentData } from "backend/environment/types";
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
		return this.invokeProcedureInBGWithRetries("build", { retryCount: 10, timeout: 1000 }, rootPath) as Promise<void>;
  }

  async getAllRecords() {
    return this.invokeProcedureInBG("getAllRecords") as Promise<any>;
  }

  async getRecord(id: string) {
    return this.invokeProcedureInBG("getRecord", id) as Promise<FileSystemResult<API>>;
  }

  async createRecord(record: API["request"], collectionId?: string) {
    console.log("ppp creating", record);
    return this.invokeProcedureInBG("createRecord", record, collectionId) as Promise<FileSystemResult<API>>;
  }

  async createRecordWithId(record: API["request"], id: string) {
    console.log("ppp1 creating with id", record);
    return this.invokeProcedureInBG("createRecordWithId", record, id) as Promise<FileSystemResult<API>>;
  }

  async updateRecord(patch: Partial<API["request"]>, id: string) {
    return this.invokeProcedureInBG("updateRecord", patch, id) as Promise<FileSystemResult<API>>;
  }

  async deleteRecord(id: string) {
    return this.invokeProcedureInBG("deleteRecord", id) as Promise<FileSystemResult<API>>;
  }

  async deleteRecords(ids: string[]) {
    return this.invokeProcedureInBG("deleteRecords", ids) as Promise<FileSystemResult<API>>;
  }

  async getCollection(id: string) {
    return this.invokeProcedureInBG("getCollection", id) as Promise<FileSystemResult<Collection>>;
  }

  async createCollection(name: string, collectionId?: string) {
    return this.invokeProcedureInBG("createCollection", name, collectionId) as Promise<FileSystemResult<Collection>>;
  }

  async renameCollection(id: string, newName: string) {
    return this.invokeProcedureInBG("renameCollection", id, newName) as Promise<FileSystemResult<Collection>>;
  }

  async getAllEnvironments() {
    return this.invokeProcedureInBG("getAllEnvironments") as Promise<any>;
  }

  async createEnvironment(environmentName: string, isGlobal?: boolean) {
    return this.invokeProcedureInBG("createEnvironment", environmentName, isGlobal) as Promise<
      FileSystemResult<EnvironmentEntity>
    >;
  }

  async updateEnvironment(id: string, patch: Partial<Pick<EnvironmentData, "name" | "variables">>) {
    return this.invokeProcedureInBG("updateEnvironment", id, patch) as Promise<FileSystemResult<EnvironmentEntity>>;
  }

  async duplicateEnvironment(id: string) {
    return this.invokeProcedureInBG("duplicateEnvironment", id) as Promise<FileSystemResult<EnvironmentEntity>>;
  }
}

class FsManagerServiceAdapterProvider {
	constructor() {
		console.log('provider created');
	}
  private service: FsManagerServiceAdapter;

  async get(rootPath: string) {
    if (this.service) {
    	console.log('got provider from cache');
      return this.service;
    }

		// const release = await buildLock.acquire();
		if (this.service) {
			return this.service;
		}
		try {
			const service = new FsManagerServiceAdapter();
			console.log('calling build', Date.now());
			await service.build(rootPath);
			console.log('received build', Date.now())
			this.service = service;
			return service;
		} catch (e) {
			console.error('build error', e);
			// release();
		}
  }
}

export const fsManagerServiceAdapterProvider = new FsManagerServiceAdapterProvider();
export function createWorkspaceFolder(path: string) {
	return rpc({
		namespace: FsManagerServiceAdapter.NAMESPACE,
		method: "createWorkspaceFolder",
	}, path);
}
