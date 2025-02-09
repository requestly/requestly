import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

export interface EnvironmentInterface<Meta extends Record<string, any>> {
  meta: Meta;
  createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData>;
  createGlobalEnvironment(): Promise<EnvironmentData>;
  deleteEnvironment(envId: string): Promise<void>;
  updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void>;
  removeVariableFromEnvironment(environmentId: string, key: string): Promise<void>;
  duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData>;
}

export interface ApiClientRecordsInterface<Meta extends Record<string, any>> {
  meta: Meta;
  getAllRecords(): RQAPI.RecordsPromise;
  getRecord(recordId: string): RQAPI.RecordPromise;
  createRecord(record: Partial<RQAPI.Record>): RQAPI.RecordPromise;
  createRecordWithId(record: Partial<RQAPI.Record>, id: string): RQAPI.RecordPromise;
  updateRecord(record: Partial<RQAPI.Record>, id?: string): RQAPI.RecordPromise;
  deleteRecords(recordIds: string[]): Promise<{ success: boolean; data: unknown; message?: string }>;
  // TODO: Add listeners
}

export interface ApiClientRepositoryInterface {
  environmentVariablesRepository: EnvironmentInterface<Record<string, any>>;
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>;
}

export type ApiClientCloudMeta = {
  uid: string;
  teamId: string;
};
