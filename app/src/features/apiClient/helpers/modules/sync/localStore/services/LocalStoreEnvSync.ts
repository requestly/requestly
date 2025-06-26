import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientLocalStoreMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { ErroredRecord } from "../../local/services/types";
import { v4 as uuidv4 } from "uuid";
import { ApiClientLocalDb } from "../helpers/ApiClientLocalDb";

export class LocalStoreEnvSync implements EnvironmentInterface<ApiClientLocalStoreMeta> {
  meta: ApiClientLocalStoreMeta;
  private storageInstance: ApiClientLocalDb;

  constructor(meta: ApiClientLocalStoreMeta) {
    this.storageInstance = new ApiClientLocalDb(meta);
  }

  private getNewId() {
    return uuidv4().split("-").join("");
  }

  async getAllEnvironments() {
    const environments = await this.storageInstance.getEnvironments();
    const environmentsMap = (environments ?? []).reduce((result, env) => {
      result[env.id] = env;
      return result;
    }, {} as EnvironmentMap);

    return {
      success: true,
      data: {
        environments: environmentsMap,
        erroredRecords: [] as ErroredRecord[],
      },
    };
  }

  async createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData> {
    const newEnvironment: EnvironmentData = {
      id: this.getNewId(),
      name: environmentName,
      variables: {},
    };

    await this.storageInstance.createEnvironment(newEnvironment);
    return newEnvironment;
  }

  async createGlobalEnvironment(): Promise<EnvironmentData> {
    const newEnvironment: EnvironmentData = {
      id: this.getGlobalEnvironmentId(),
      name: "Global Environment",
      variables: {},
    };

    await this.storageInstance.createEnvironment(newEnvironment);
    return newEnvironment;
  }

  async createEnvironments(environments: EnvironmentData[]): Promise<EnvironmentData[]> {
    const environmentsWithIds = environments.map((env) => {
      return { ...env, id: env.id || this.getNewId() };
    });

    await this.storageInstance.createBulkEnvironments(environmentsWithIds);
    return environmentsWithIds;
  }

  async deleteEnvironment(envId: string): Promise<{ success: boolean; message?: string }> {
    await this.storageInstance.deleteEnvironment(envId);
    return { success: true };
  }

  async updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void> {
    const environment = await this.storageInstance.getEnvironment(environmentId);

    if (environment) {
      if (updates.name) {
        environment.name = updates.name;
      }

      if (updates.variables) {
        environment.variables = { ...environment.variables, ...updates.variables };
      }

      await this.storageInstance.updateEnvironment(environmentId, environment);
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

  async clear() {
    await this.storageInstance.clearEnvironments();
  }
}
