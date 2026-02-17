// import { isFeatureCompatible } from "utils/CompatibilityUtils";
import type {
  API,
  APIEntity,
  Collection,
  EnvironmentEntity,
  ErroredRecord,
  FileType,
  FileSystemResult,
} from "features/apiClient/helpers/modules/sync/local/services/types";
import BackgroundServiceAdapter, { rpc, rpcWithRetry } from "./DesktopBackgroundService";
import type { EnvironmentData, EnvironmentVariables } from "backend/environment/types";
import type { RQAPI } from "features/apiClient/types";
import { FsAccessError } from "features/apiClient/errors/FsError/FsAccessError/FsAccessError";
import { ErrorCode } from "errors/types";
import { Mutex, withTimeout } from "async-mutex";
import type { MutexInterface } from "async-mutex";

const LOCAL_SYNC_BUILDER_NAMESPACE = "local_sync_builder";

function FsErrorHandler(_target: unknown, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    try {
      const result = await originalMethod.apply(this, args);
      if (result.type === "error") {
        if (result.error.code === ErrorCode.PermissionDenied) {
          const message = result.error.message || "Permission denied for requested action";
          throw FsAccessError.from(message, result.error.path);
        }
        return result;
      }
      return result;
    } catch (error) {
      if (error.code === "EACCESS" || error.code === ErrorCode.PermissionDenied) {
        const message = error.message || "Permission denied for requested action";
        throw FsAccessError.from(message, error.meta);
      }
      throw error;
    }
  };
}

export class FsManagerServiceAdapter extends BackgroundServiceAdapter {
  constructor(rootPath: string) {
    super(`local_sync: ${rootPath}`);
    // if (!isFeatureCompatible(FEATURES.LOCAL_FILE_SYNC)) {
    //   throw new Error("LocalFileSync is not supported in the current version of the app");
    // }
  }

  @FsErrorHandler
  async getAllRecords() {
    return this.invokeProcedureInBG("getAllRecords") as Promise<
      FileSystemResult<{ records: APIEntity[]; erroredRecords: ErroredRecord[] }>
    >;
  }

  @FsErrorHandler
  async getRecord(id: string) {
    return this.invokeProcedureInBG("getRecord", id) as Promise<FileSystemResult<API>>;
  }

  @FsErrorHandler
  async createRecord(record: API["data"], collectionId?: RQAPI.CollectionRecord["collectionId"]) {
    return this.invokeProcedureInBG("createRecord", record, collectionId) as Promise<FileSystemResult<API>>;
  }

  @FsErrorHandler
  async createRecordWithId(record: API["data"], id: string, collectionId: RQAPI.CollectionRecord["collectionId"]) {
    return this.invokeProcedureInBG("createRecordWithId", record, id, collectionId) as Promise<FileSystemResult<API>>;
  }

  @FsErrorHandler
  async updateRecord(patch: Partial<API["data"]>, id: string) {
    return this.invokeProcedureInBG("updateRecord", patch, id) as Promise<FileSystemResult<API>>;
  }

  @FsErrorHandler
  async deleteRecord(id: string) {
    return this.invokeProcedureInBG("deleteRecord", id) as Promise<FileSystemResult<void>>;
  }

  @FsErrorHandler
  async deleteRecords(ids: string[]) {
    return this.invokeProcedureInBG("deleteRecords", ids) as Promise<FileSystemResult<void>>;
  }

  @FsErrorHandler
  async getCollection(id: string) {
    return this.invokeProcedureInBG("getCollection", id) as Promise<FileSystemResult<Collection>>;
  }

  @FsErrorHandler
  async createCollection(name: string, collectionId?: RQAPI.CollectionRecord["collectionId"]) {
    return this.invokeProcedureInBG("createCollection", name, collectionId) as Promise<FileSystemResult<Collection>>;
  }

  @FsErrorHandler
  async renameCollection(id: string, newName: string) {
    return this.invokeProcedureInBG("renameCollection", id, newName) as Promise<FileSystemResult<Collection>>;
  }

  @FsErrorHandler
  async getAllEnvironments() {
    return this.invokeProcedureInBG("getAllEnvironments") as Promise<
      FileSystemResult<{ environments: EnvironmentEntity[]; erroredRecords: ErroredRecord[] }>
    >;
  }

  @FsErrorHandler
  async createEnvironment(environmentName: string, isGlobal?: boolean) {
    return this.invokeProcedureInBG("createEnvironment", environmentName, isGlobal) as Promise<
      FileSystemResult<EnvironmentEntity>
    >;
  }

  @FsErrorHandler
  async updateEnvironment(id: string, patch: Partial<Pick<EnvironmentData, "name" | "variables">>) {
    return this.invokeProcedureInBG("updateEnvironment", id, patch) as Promise<FileSystemResult<EnvironmentEntity>>;
  }

  @FsErrorHandler
  async duplicateEnvironment(id: string) {
    return this.invokeProcedureInBG("duplicateEnvironment", id) as Promise<FileSystemResult<EnvironmentEntity>>;
  }

  @FsErrorHandler
  async deleteCollections(ids: string[]) {
    return this.invokeProcedureInBG("deleteCollections", ids) as Promise<FileSystemResult<EnvironmentEntity>>;
  }

  @FsErrorHandler
  async setCollectionVariables(id: string, variables: EnvironmentVariables) {
    return this.invokeProcedureInBG("setCollectionVariables", id, variables) as Promise<FileSystemResult<Collection>>;
  }

  @FsErrorHandler
  async updateCollectionDescription(id: string, newDescription: string) {
    return this.invokeProcedureInBG("updateCollectionDescription", id, newDescription) as Promise<
      FileSystemResult<string>
    >;
  }

  @FsErrorHandler
  async updateCollectionAuthData(id: string, newAuth: RQAPI.Auth) {
    return this.invokeProcedureInBG("updateCollectionAuthData", id, newAuth) as Promise<FileSystemResult<RQAPI.Auth>>;
  }

  @FsErrorHandler
  async writeRawRecord(id: string, record: unknown, fileType: FileType) {
    return this.invokeProcedureInBG("writeRawRecord", id, record, fileType) as Promise<FileSystemResult<unknown>>;
  }

  @FsErrorHandler
  async getRawFileData(id: string) {
    return this.invokeProcedureInBG("getRawFileData", id) as Promise<FileSystemResult<string>>;
  }

  @FsErrorHandler
  async createCollectionFromCompleteRecord(collection: RQAPI.CollectionRecord, id: string) {
    return this.invokeProcedureInBG("createCollectionFromCompleteRecord", collection, id) as Promise<
      FileSystemResult<RQAPI.ApiClientRecord>
    >;
  }

  @FsErrorHandler
  async moveRecord(id: string, newParentId: string) {
    return this.invokeProcedureInBG("moveRecord", id, newParentId) as Promise<FileSystemResult<RQAPI.ApiClientRecord>>;
  }

  @FsErrorHandler
  async moveCollection(id: string, newParentId: string) {
    return this.invokeProcedureInBG("moveCollection", id, newParentId) as Promise<
      FileSystemResult<RQAPI.ApiClientRecord>
    >;
  }
}

class FsManagerServiceAdapterProvider {
  private cache = new Map<string, FsManagerServiceAdapter>();
  private lockMap = new Map<string, MutexInterface>();
  constructor() {
    console.log("provider created");
  }

  async get(rootPath: string): Promise<FsManagerServiceAdapter> {
    let lock = this.lockMap.get(rootPath);
    if (!lock) {
      lock = withTimeout(new Mutex(), 40 * 1000); // Must exceed RPC timeout (30s) + retry overhead;
      this.lockMap.set(rootPath, lock);
    }

    // [PERF] Start timing for lock acquisition
    const lockAcquireStart = performance.now();
    console.log(`[PERF] FsManagerServiceAdapter.get() starting for rootPath: ${rootPath}`);

    await lock.acquire();

    const lockAcquireTime = performance.now() - lockAcquireStart;
    console.log(`[PERF] Lock acquired in ${lockAcquireTime.toFixed(2)}ms`);

    const fsManagerServiceAdapter = this.cache.get(rootPath);

    if (fsManagerServiceAdapter) {
      console.log("[PERF] Got provider from cache");
      lock.release();
      return fsManagerServiceAdapter;
    }
    try {
      // [PERF] Start timing for buildFsManager RPC call
      const buildFsStart = performance.now();
      console.log("[PERF] buildFsManager() RPC call starting...");

      await buildFsManager(rootPath);

      const buildFsTime = performance.now() - buildFsStart;
      console.log(`[PERF] buildFsManager() RPC call completed in ${buildFsTime.toFixed(2)}ms`);

      if (buildFsTime > 10000) {
        console.warn(
          `[PERF] ⚠️ WARNING: buildFsManager took ${buildFsTime.toFixed(
            2
          )}ms (>10s). This may indicate a large workspace.`
        );
      }
      if (buildFsTime > 30000) {
        console.error(`[PERF] ❌ ERROR: buildFsManager took ${buildFsTime.toFixed(2)}ms (>30s). MUTEX TIMEOUT LIKELY!`);
      }

      const service = new FsManagerServiceAdapter(rootPath);
      this.cache.set(rootPath, service);
      return service;
    } catch (e) {
      console.error("[PERF] ❌ ERROR in FsManagerServiceAdapter.get():", e);
      const isAccessIssue = (arg: unknown) => typeof arg === "string" && arg.includes("EACCES:");
      if (isAccessIssue(e) || (e && typeof e === "object" && "message" in e && isAccessIssue(e.message))) {
        const errorMessage = e && typeof e === "object" && "message" in e ? String(e.message) : String(e);
        throw new FsAccessError(errorMessage, rootPath);
      }
      throw e;
    } finally {
      lock.release();
      const totalTime = performance.now() - lockAcquireStart;
      console.log(
        `[PERF] FsManagerServiceAdapter.get() completed in ${totalTime.toFixed(2)}ms (including lock release)`
      );
    }
  }
}

export const fsManagerServiceAdapterProvider = new FsManagerServiceAdapterProvider();
export function buildFsManager(rootPath: string) {
  return rpcWithRetry(
    {
      namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
      method: "build",
      retryCount: 3, // Reduced from 10 - each retry adds significant time
      timeout: 1000 * 20, // 20s timeout: accounts for ~5s IPC buffering during cold start + ~5s work + 10s safety margin
    },
    rootPath
  ) as Promise<void>;
}

export const reloadFsManager = (rootPath: string) => {
  return rpc(
    {
      namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
      method: "reload",
      timeout: 1000,
    },
    rootPath
  ) as Promise<void>;
};
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

export function createDefaultWorkspace() {
  return rpc({
    namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
    method: "createDefaultWorkspace",
    timeout: 80000,
  }) as Promise<FileSystemResult<{ id: string; name: string; path: string }>>;
}

export function getAllWorkspaces() {
  return rpcWithRetry({
    namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
    method: "getAllWorkspaces",
    retryCount: 3, // Reduced from 10 - each retry adds 30s
    timeout: 1000,
  }) as Promise<FileSystemResult<{ id: string; name: string; path: string }[]>>;
}

export function openExistingLocalWorkspace(workspacePath: string) {
  return rpc(
    {
      namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
      method: "openExistingLocalWorkspace",
      timeout: 10000,
    },
    workspacePath
  ) as Promise<FileSystemResult<{ id: string; name: string; path: string }>>;
}

export function checkIsWorkspacePathAvailable(path: string) {
  return rpc(
    {
      namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
      method: "checkIsWorkspacePathAvailable",
      timeout: 10000,
    },
    path
  ) as Promise<boolean>;
}

export function removeWorkspace(
  workspaceId: string,
  opts: { deleteDirectory?: boolean } = {}
): Promise<FileSystemResult<void>> {
  return rpc(
    {
      namespace: LOCAL_SYNC_BUILDER_NAMESPACE,
      method: "removeWorkspace",
      timeout: 10000,
    },
    workspaceId,
    opts
  ) as Promise<FileSystemResult<void>>;
}
