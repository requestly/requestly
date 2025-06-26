import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientLocalStoreMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { ErroredRecord } from "../../local/services/types";
import { v4 as uuidv4 } from "uuid";
import { ApiClientLocalDbQueryService } from "../helpers";
import { ApiClientLocalDbTable } from "../helpers/types";

export class LocalStoreEnvSync implements ApiClientLocalDbInterface, EnvironmentInterface<ApiClientLocalStoreMeta> {
  meta: ApiClientLocalStoreMeta;
  private queryService: ApiClientLocalDbQueryService<EnvironmentData>;

  constructor(meta: ApiClientLocalStoreMeta) {
    this.meta = meta;
    this.queryService = new ApiClientLocalDbQueryService<EnvironmentData>(meta, ApiClientLocalDbTable.ENVIRONMENTS);
  }

  private getNewId() {
    return uuidv4().split("-").join("");
  }

  private getAdapter() {
    return apiClientLocalDbAdapterProvider.get<EnvironmentData>(this.meta);
  }

  async getAllEnvironments() {
    const environments = await this.queryService.getRecords();
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

    await this.queryService.createRecord(newEnvironment);
    return newEnvironment;
  }

  async createGlobalEnvironment(): Promise<EnvironmentData> {
    const newEnvironment: EnvironmentData = {
      id: this.getGlobalEnvironmentId(),
      name: "Global Environment",
      variables: {},
    };

    await this.queryService.createRecord(newEnvironment);
    return newEnvironment;
  }

  async createEnvironments(environments: EnvironmentData[]): Promise<EnvironmentData[]> {
    const environmentsWithIds = environments.map((env) => {
      return { ...env, id: env.id || this.getNewId() };
    });

    await this.getAdapter().createBulkRecords(this.tableName, environmentsWithIds);
    return environmentsWithIds;
  }

  async deleteEnvironment(envId: string): Promise<{ success: boolean; message?: string }> {
    await this.queryService.deleteRecord(envId);
    return { success: true };
  }

  async updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void> {
    const environment = await this.queryService.getRecord(environmentId);

    if (environment) {
      if (updates.name) {
        environment.name = updates.name;
      }

      if (updates.variables) {
        environment.variables = { ...environment.variables, ...updates.variables };
      }

      await this.queryService.updateRecord(environmentId, environment);
    } else {
      throw new Error("Environment not found");
    }
  }

  async duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData> {
    const environment = allEnvironments[environmentId];

    if (environment) {
      const newEnvironment = await this.createNonGlobalEnvironment(`${environment.name} (Copy)`);
      newEnvironment.variables = { ...environment.variables };
      await this.updateEnvironment(newEnvironment.id, { variables: newEnvironment.variables });
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
    await this.queryService.clearAllRecords();
  }
}
