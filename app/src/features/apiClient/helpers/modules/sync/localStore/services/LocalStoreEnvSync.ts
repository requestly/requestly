import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientLocalStoreMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { ErroredRecord } from "../../local/services/types";
import { LocalStoreSyncRecords } from "./types";
import { v4 as uuidv4 } from "uuid";
import { ApiClientLocalStorage } from "../helpers/ApiClientLocalStorage";

export class LocalStoreEnvSync implements EnvironmentInterface<ApiClientLocalStoreMeta> {
  meta: ApiClientLocalStoreMeta;
  private storageInstance: ApiClientLocalStorage;

  constructor(metadata: ApiClientLocalStoreMeta) {
    this.meta = metadata;
    this.storageInstance = ApiClientLocalStorage.getInstance();
  }

  private getNewId() {
    return uuidv4();
  }

  private getLocalStorageRecords(): LocalStoreSyncRecords {
    return this.storageInstance.getRecords();
  }

  async getAllEnvironments() {
    const records = this.getLocalStorageRecords();
    const environments = records.environments;

    if (Object.keys(environments).length > 0) {
      return {
        success: true,
        data: {
          environments,
          erroredRecords: [] as ErroredRecord[],
        },
      };
    } else {
      return {
        success: true,
        data: {
          environments: {},
          erroredRecords: [],
        },
      };
    }
  }

  async createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData> {
    const records = this.getLocalStorageRecords();

    const newEnvironment: EnvironmentData = {
      id: this.getNewId(),
      name: environmentName,
      variables: {},
    };

    records.environments[newEnvironment.id] = newEnvironment;
    this.storageInstance.setRecords(records);
    return newEnvironment;
  }

  async createGlobalEnvironment(): Promise<EnvironmentData> {
    const records = this.getLocalStorageRecords();

    const newEnvironment: EnvironmentData = {
      id: this.getGlobalEnvironmentId(),
      name: "Global Environment",
      variables: {},
    };

    records.environments[newEnvironment.id] = newEnvironment;
    this.storageInstance.setRecords(records);
    return newEnvironment;
  }

  async deleteEnvironment(envId: string): Promise<{ success: boolean; message?: string }> {
    const records = this.getLocalStorageRecords();
    if (records.environments[envId]) {
      delete records.environments[envId];
      this.storageInstance.setRecords(records);
      return { success: true };
    } else {
      return { success: false, message: "Something went wrong while deleting the environment" };
    }
  }

  async updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void> {
    const records = this.getLocalStorageRecords();
    const environment = records.environments[environmentId];

    if (environment) {
      if (updates.name) {
        environment.name = updates.name;
      }

      if (updates.variables) {
        environment.variables = { ...environment.variables, ...updates.variables };
      }

      records.environments[environmentId] = environment;
      this.storageInstance.setRecords(records);
    } else {
      throw new Error("Environment not found");
    }
  }

  async duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData> {
    const environment = allEnvironments[environmentId];

    if (environment) {
      const newEnvironment = await this.createNonGlobalEnvironment(`${environment.name} (Copy)`);
      return newEnvironment;
    } else {
      throw new Error("Environment not found for duplication");
    }
  }

  getGlobalEnvironmentId(): string {
    return "global";
  }

  attachListener(params: EnvironmentListenerParams): () => any {
    return () => {};
  }
}
