// import { isFeatureCompatible } from "utils/CompatibilityUtils";
import {
  API,
  APIEntity,
  Collection,
  EnvironmentEntity,
  ErroredRecord,
  FileSystemResult,
  FileType,
} from "features/apiClient/helpers/modules/sync/local/services/types";
import BackgroundServiceAdapter, { rpc, rpcWithRetry } from "./DesktopBackgroundService";
import { EnvironmentData, EnvironmentVariables } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

const LOCAL_SYNC_BUILDER_NAMESPACE = "local_sync_builder";

export class FsManagerServiceAdapter extends BackgroundServiceAdapter {
  constructor(rootPath: string) {
    super(`local_sync: ${rootPath}`);
    // if (!isFeatureCompatible(FEATURES.LOCAL_FILE_SYNC)) {
    //   throw new Error("LocalFileSync is not supported in the current version of the app");
    // }
  }

  async getAllRecords() {
    return this.invokeProcedureInBG("getAllRecords") as Promise<
      FileSystemResult<{ records: APIEntity[]; erroredRecords: ErroredRecord[] }>
    >;
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
    return this.invokeProcedureInBG("deleteRecord", id) as Promise<FileSystemResult<void>>;
  }

  async deleteRecords(ids: string[]) {
    return this.invokeProcedureInBG("deleteRecords", ids) as Promise<FileSystemResult<void>>;
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
    return this.invokeProcedureInBG("getAllEnvironments") as Promise<
      FileSystemResult<{ environments: EnvironmentEntity[]; erroredRecords: ErroredRecord[] }>
    >;
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

  async deleteCollections(ids: string[]) {
    return this.invokeProcedureInBG("deleteCollections", ids) as Promise<FileSystemResult<EnvironmentEntity>>;
  }

  async setCollectionVariables(id: string, variables: EnvironmentVariables) {
    return this.invokeProcedureInBG("setCollectionVariables", id, variables) as Promise<FileSystemResult<Collection>>;
  }

  async updateCollectionDescription(id: string, newDescription: string) {
    return this.invokeProcedureInBG("updateCollectionDescription", id, newDescription) as Promise<
      FileSystemResult<string>
    >;
  }
  async updateCollectionAuthData(id: string, newAuth: RQAPI.Auth) {
    return this.invokeProcedureInBG("updateCollectionAuthData", id, newAuth) as Promise<FileSystemResult<RQAPI.Auth>>;
  }

  async writeRawRecord(id: string, record: any, fileType: FileType) {
    return this.invokeProcedureInBG("writeRawRecord", id, record, fileType) as Promise<FileSystemResult<unknown>>;
  }

  async getRawFileData(id: string) {
    return this.invokeProcedureInBG("getRawFileData", id) as Promise<FileSystemResult<unknown>>;
  }

  async createCollectionFromCompleteRecord(collection: RQAPI.CollectionRecord, id: string) {
    return this.invokeProcedureInBG("createCollectionFromCompleteRecord", collection, id) as Promise<
      FileSystemResult<RQAPI.Record>
    >;
  }

  async moveRecord(id: string, newParentId: string) {
    return this.invokeProcedureInBG("moveRecord", id, newParentId) as Promise<FileSystemResult<RQAPI.Record>>;
  }

  async moveCollection(id: string, newParentId: string) {
    return this.invokeProcedureInBG("moveCollection", id, newParentId) as Promise<FileSystemResult<RQAPI.Record>>;
  }
}

class FsManagerServiceAdapterProvider {
  private cache = new Map<string, FsManagerServiceAdapter>();
  constructor() {
    console.log("provider created");
  }

  async get(rootPath: string) {
    if (this.cache.has(rootPath)) {
      console.log("got provider from cache");
      return this.cache.get(rootPath);
    }
    try {
      console.log("calling build", Date.now());
      await buildFsManager(rootPath);
      console.log("received build", Date.now());
      const service = new FsManagerServiceAdapter(rootPath);
      this.cache.set(rootPath, service);
      return service;
    } catch (e) {
      console.error("build error", e);
      throw e;
    }
  }
}

export const fsManagerServiceAdapterProvider = new FsManagerServiceAdapterProvider();
export function buildFsManager(rootPath: string) {
  return rpcWithRetry(
    {
      namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
      method: "build",
      retryCount: 10,
      timeout: 1000,
    },
    rootPath
  ) as Promise<void>;
}
export function createWorkspaceFolder(name: string, path: string) {
  return rpc(
    {
      namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
      method: "createWorkspaceFolder",
      timeout: 80000,
    },
    name,
    path
  ) as Promise<FileSystemResult<{ id: string; name: string; path: string }>>;
}
export function getAllWorkspaces() {
  return rpc({
    namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
    method: "getAllWorkspaces",
  }) as Promise<FileSystemResult<{ id: string; name: string; path: string }[]>>;
}
