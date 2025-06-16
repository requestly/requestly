import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientLocalStorageMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { ErroredRecord } from "../../local/services/types";
import { LocalStorageSyncRecords } from "./types";

export class LocalStorageEnvSync implements EnvironmentInterface<ApiClientLocalStorageMeta> {
  meta: ApiClientLocalStorageMeta;

  constructor(metadata: ApiClientLocalStorageMeta) {
    this.meta = metadata;
  }

  private getVersion() {
    return this.meta.version;
  }

  private getStorageKey() {
    return `${this.meta.storageKey}:v${this.getVersion()}`;
  }

  private getNewId() {
    return `${Date.now()}`;
  }

  private getLocalStorageRecords(): LocalStorageSyncRecords {
    return JSON.parse(localStorage.getItem(this.getStorageKey())) || { apis: [], environments: {} };
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
    localStorage.setItem(this.getStorageKey(), JSON.stringify(records));
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
    localStorage.setItem(this.getStorageKey(), JSON.stringify(records));
    return newEnvironment;
  }

  async deleteEnvironment(envId: string): Promise<{ success: boolean; message?: string }> {
    const records = this.getLocalStorageRecords();
    if (records.environments[envId]) {
      delete records.environments[envId];
      localStorage.setItem(this.getStorageKey(), JSON.stringify(records));
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
      localStorage.setItem(this.getStorageKey(), JSON.stringify(records));
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
