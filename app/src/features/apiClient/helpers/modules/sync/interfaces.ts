import { EnvironmentData, EnvironmentMap, VariableScope } from "backend/environment/types";
import { CollectionVariableMap, RQAPI } from "features/apiClient/types";

export interface EnvironmentInterface<Meta extends Record<string, any>> {
  meta: Meta;
  getAllEnvironments(): Promise<EnvironmentMap>;
  createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData>;
  createGlobalEnvironment(): Promise<EnvironmentData>;
  deleteEnvironment(envId: string): Promise<void>;
  updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void>;
  duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData>;
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
  deleteRecords(recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string }>;

  generateApiRecordId(parentId?: string): string;
  generateCollectionId(name: string, parentId?: string): string;
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

export type EnvironmentListenerParams =
  | { scope: VariableScope.COLLECTION; callback: (data: CollectionVariableMap) => void }
  | { scope: Exclude<VariableScope, VariableScope.COLLECTION>; id: string; callback: (data: EnvironmentData) => void };
