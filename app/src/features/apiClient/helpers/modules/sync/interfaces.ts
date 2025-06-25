import { EnvironmentData, EnvironmentMap, EnvironmentVariables, VariableScope } from "backend/environment/types";
import { CollectionVariableMap, RQAPI } from "features/apiClient/types";
import { ErroredRecord, FileType } from "./local/services/types";

export interface EnvironmentInterface<Meta extends Record<string, any>> {
  meta: Meta;
  getAllEnvironments(): Promise<{
    success: boolean;
    data: { environments: EnvironmentMap; erroredRecords: ErroredRecord[] };
  }>;
  createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData>;
  createGlobalEnvironment(): Promise<EnvironmentData>;
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
  getRecord(recordId: string): RQAPI.RecordPromise;
  createRecord(record: Partial<RQAPI.ApiRecord>): RQAPI.RecordPromise;
  createCollection(record: Partial<RQAPI.CollectionRecord>): RQAPI.RecordPromise;
  createRecordWithId(record: Partial<RQAPI.Record>, id: string): RQAPI.RecordPromise;
  updateRecord(record: Partial<Omit<RQAPI.Record, "id">>, id: string): RQAPI.RecordPromise;
  deleteRecords(recordIds: string[]): Promise<{ success: boolean; message?: string }>;
  deleteCollections(ids: string[]): Promise<{ success: boolean; data: unknown; message?: string }>;
  setCollectionVariables(
    id: string,
    variables: EnvironmentVariables
  ): Promise<{ success: boolean; data: unknown; message?: string }>;

  getCollection(recordId: string): RQAPI.RecordPromise;
  renameCollection(id: string, newName: string): RQAPI.RecordPromise;
  updateCollectionDescription(
    id: string,
    description: string
  ): Promise<{ success: boolean; data: string; message?: string }>;
  updateCollectionAuthData(
    collection: RQAPI.CollectionRecord
  ): Promise<{ success: boolean; data: RQAPI.Record; message?: string }>;

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
  ): Promise<{ success: boolean; data: RQAPI.Record; message?: string }>;
  generateCollectionId(name: string, parentId?: string): string;
  generateApiRecordId(parentId?: string): string;
  batchWriteApiEntities(
    batchSize: number,
    entities: Partial<RQAPI.Record>[],
    writeFunction: (entity: RQAPI.Record) => Promise<unknown>
  ): Promise<{ success: boolean; message?: string }>;
  duplicateApiEntities(entities: Partial<RQAPI.Record>[]): Promise<RQAPI.Record[]>;
  moveAPIEntities(entities: Partial<RQAPI.Record>[], newParentId: string): Promise<RQAPI.Record[]>;
  clear?(): Promise<void>;
  batchCreateRecordsWithExistingId(records: RQAPI.Record[]): RQAPI.RecordsPromise;
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
