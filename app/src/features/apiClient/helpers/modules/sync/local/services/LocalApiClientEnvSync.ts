import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientLocalMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { EnvironmentEntity, FileSystemResult } from "./types";
import { appendPath, parseEntityVariables } from "../../utils";

export class LocalEnvSync implements EnvironmentInterface<ApiClientLocalMeta> {
  constructor(readonly meta: ApiClientLocalMeta) {}

  private async getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.meta.rootPath);
  }

  private parseEnvironmentEntitiesToMap(entities: EnvironmentEntity[]): EnvironmentMap {
    console.log("env entities", entities);
    const environmentsMap = entities.reduce((acc, cur) => {
      acc[cur.id] = {
        id: cur.id,
        name: cur.name,
        variables: parseEntityVariables(cur?.variables || {}),
      };
      return acc;
    }, {} as EnvironmentMap);

    return environmentsMap;
  }

  private parseEnvironmentEntity(entity: EnvironmentEntity): EnvironmentData {
    const environment: EnvironmentData = {
      id: entity.id,
      name: entity.name,
      variables: entity.variables,
    };

    return environment;
  }

  async getAllEnvironments() {
    const service = await this.getAdapter();
    const result = await service.getAllEnvironments();
    if (result.type === "success") {
      const parsedEnvs = this.parseEnvironmentEntitiesToMap(result.content.environments);
      const globalEnvPath = `${this.meta.rootPath}/environments/global.json`;
      if (!parsedEnvs[globalEnvPath]) {
        const globalEnv = await this.createGlobalEnvironment();
        parsedEnvs[globalEnvPath] = globalEnv;
      }
      return {
        success: true,
        data: {
          environments: parsedEnvs,
          erroredRecords: result.content.erroredRecords,
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

  async getEnvironmentById(
    envId: string
  ): Promise<{
    success: boolean;
    data: EnvironmentData | null;
  }> {
    return {
      success: true,
      data: null,
    };
  }

  async createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData> {
    const service = await this.getAdapter();
    const result: FileSystemResult<EnvironmentEntity> = await service.createEnvironment(environmentName, false);
    if (result.type === "error") {
      throw new Error("Something went wrong while create a new environment.");
    }
    const parsedEnv = this.parseEnvironmentEntity(result.content);
    return parsedEnv;
  }

  async createGlobalEnvironment(): Promise<EnvironmentData> {
    const service = await this.getAdapter();
    const result: FileSystemResult<EnvironmentEntity> = await service.createEnvironment("Global Variables", true);
    if (result.type === "success") {
      const parsedEnv = this.parseEnvironmentEntity(result.content);
      return parsedEnv;
    }
    // TODO: FIX THIS
    return null;
  }

  async createEnvironments(environments: EnvironmentData[]): Promise<EnvironmentData[]> {
    const promises = environments.map(async (env) => {
      return this.createNonGlobalEnvironment(env.name).then((envData) => {
        this.updateEnvironment(envData.id, { variables: env.variables });
        return envData;
      });
    });

    return Promise.all(promises);
  }

  async deleteEnvironment(envId: string) {
    const service = await this.getAdapter();
    const result = await service.deleteRecord(envId);
    if (result.type === "success") {
      return { success: true };
    } else {
      return { success: false, message: "Something went wrong while deleting environment" };
    }
  }

  async updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void> {
    const service = await this.getAdapter();
    const result: FileSystemResult<EnvironmentEntity> = await service.updateEnvironment(environmentId, updates);
    if (result.type === "error") {
      throw new Error("Something went wrong while updating environment");
    }
  }

  async duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData> {
    const service = await this.getAdapter();
    const result: FileSystemResult<EnvironmentEntity> = await service.duplicateEnvironment(environmentId);
    if (result.type === "error") {
      throw new Error("Something went wrong while updating environment");
    }
    const parsedEnv = this.parseEnvironmentEntity(result.content);
    return parsedEnv;
  }

  getGlobalEnvironmentId(): string {
    return appendPath(this.meta.rootPath, appendPath("environments", "global.json"));
  }

  attachListener(params: EnvironmentListenerParams): () => any {
    return () => {};
  }
}
