import { EnvironmentData, EnvironmentMap, EnvironmentVariables, VariableScope } from "backend/environment/types";
import { CollectionVariableMap, RQAPI } from "features/apiClient/types";
import { ErroredRecord, FileType } from "./local/services/types";
import { ResponsePromise } from "backend/types";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { RunResult, SavedRunResult } from "features/apiClient/store/collectionRunResult/runResult.store";

export interface EnvironmentInterface<Meta extends Record<string, any>> {
  meta: Meta;
  getAllEnvironments(): Promise<{
    success: boolean;
    data: { environments: EnvironmentMap; erroredRecords: ErroredRecord[] };
  }>;
  getEnvironmentById(
    envId: string
  ): Promise<{
    success: boolean;
    data: EnvironmentData | null;
  }>;
  createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData>;
  createGlobalEnvironment(): Promise<EnvironmentData>;
  createEnvironments(environments: EnvironmentData[]): Promise<EnvironmentData[]>;
  deleteEnvironment(envId: string): Promise<{ success: boolean; message?: string }>;
  updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void>;
  duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData>;
  getGlobalEnvironmentId(): string;
  attachListener(params: EnvironmentListenerParams): () => any;
}

export interface ApiClientRecordsInterface<Meta extends Record<string, any>> {
  meta: Meta;
  getAllRecords(): RQAPI.RecordsPromise;
  getRecord(recordId: string): RQAPI.ApiClientRecordPromise;
  createRecord(record: Partial<RQAPI.ApiRecord>): RQAPI.ApiClientRecordPromise;
  createCollection(record: Partial<RQAPI.CollectionRecord>): RQAPI.ApiClientRecordPromise;
  createRecordWithId(record: Partial<RQAPI.ApiClientRecord>, id: string): RQAPI.ApiClientRecordPromise;
  updateRecord(record: Partial<Omit<RQAPI.ApiClientRecord, "id">>, id: string): RQAPI.ApiClientRecordPromise;
  deleteRecords(recordIds: string[]): Promise<{ success: boolean; message?: string }>;
  deleteCollections(ids: string[]): Promise<{ success: boolean; data: unknown; message?: string }>;
  setCollectionVariables(
    id: string,
    variables: EnvironmentVariables
  ): Promise<{ success: boolean; data: unknown; message?: string }>;

  getCollection(recordId: string): RQAPI.ApiClientRecordPromise;
  renameCollection(id: string, newName: string): RQAPI.ApiClientRecordPromise;
  updateCollectionDescription(
    id: string,
    description: string
  ): Promise<{ success: boolean; data: string; message?: string }>;
  updateCollectionAuthData(
    collection: RQAPI.CollectionRecord
  ): Promise<{ success: boolean; data: RQAPI.ApiClientRecord; message?: string }>;

  getRecordsForForceRefresh(): RQAPI.RecordsPromise | Promise<void>;
  writeToRawFile(
    id: string,
    record: any,
    fileType: FileType
  ): Promise<{ success: boolean; data: unknown; message?: string }>;
  getRawFileData(id: string): Promise<{ success: boolean; data: unknown; message?: string }>;
  createCollectionFromImport(
    collection: RQAPI.CollectionRecord,
    id: string
  ): Promise<{ success: boolean; data: RQAPI.ApiClientRecord; message?: string }>;
  generateCollectionId(name: string, parentId?: string): string;
  generateApiRecordId(parentId?: string): string;
  batchWriteApiEntities(
    batchSize: number,
    entities: Partial<RQAPI.ApiClientRecord>[],
    writeFunction: (entity: RQAPI.ApiClientRecord) => Promise<unknown>
  ): Promise<{ success: boolean; message?: string }>;
  batchCreateCollectionRunDetails(
    details: {
      collectionId: RQAPI.CollectionRecord["id"];
      runConfigs?: Record<string, SavedRunConfig>;
      runResults?: RunResult[];
    }[]
  ): RQAPI.RecordsPromise;
  duplicateApiEntities(entities: Partial<RQAPI.ApiClientRecord>[]): Promise<RQAPI.ApiClientRecord[]>;
  moveAPIEntities(entities: Partial<RQAPI.ApiClientRecord>[], newParentId: string): Promise<RQAPI.ApiClientRecord[]>;
  batchCreateRecordsWithExistingId(records: RQAPI.ApiClientRecord[]): RQAPI.RecordsPromise;

  // collection runner
  getRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfigId: RQAPI.RunConfig["id"]
  ): ResponsePromise<SavedRunConfig>;

  upsertRunConfig(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runConfig: SavedRunConfig
  ): ResponsePromise<SavedRunConfig>;

  getRunResults(collectionId: RQAPI.ApiClientRecord["collectionId"]): ResponsePromise<RunResult[]>;
  addRunResult(
    collectionId: RQAPI.ApiClientRecord["collectionId"],
    runResult: RunResult
  ): ResponsePromise<SavedRunResult>;
}

export interface ApiClientRepositoryInterface {
  environmentVariablesRepository: EnvironmentInterface<Record<string, any>>;
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>;
}

export type ApiClientCloudMeta = {
  uid: string;
  teamId: string;
};

export type ApiClientLocalMeta = {
  rootPath: string;
};

export type ApiClientLocalStoreMeta = {
  version: number;
};

export type EnvironmentListenerParams =
  | { scope: VariableScope.COLLECTION; callback: (data: CollectionVariableMap) => void }
  | { scope: Exclude<VariableScope, VariableScope.COLLECTION>; id: string; callback: (data: EnvironmentData) => void };
