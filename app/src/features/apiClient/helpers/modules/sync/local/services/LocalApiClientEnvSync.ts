import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientLocalMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { EnvironmentEntity, FileSystemResult } from "./types";
import { parseEntityVariables } from "../../utils";

export class LocalEnvSync implements EnvironmentInterface<ApiClientLocalMeta> {
  constructor(readonly meta: ApiClientLocalMeta) {}

  private async getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.meta.rootPath);
  }

  private parseEnvironmentEntitiesToMap(entities: EnvironmentEntity[]): EnvironmentMap {
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
    const result: FileSystemResult<EnvironmentEntity[]> = await service.getAllEnvironments();
    if (result.type === "success") {
      const parsedEnvs = this.parseEnvironmentEntitiesToMap(result.content);
      const globalEnvPath = `${this.meta.rootPath}/environments/global.json`;
      if (!parsedEnvs[globalEnvPath]) {
        const globalEnv = await this.createGlobalEnvironment();
        parsedEnvs[globalEnvPath] = globalEnv;
      }
      return parsedEnvs;
    } else {
      return {};
    }
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

  async deleteEnvironment(envId: string): Promise<void> {
    const service = await this.getAdapter();
    const result = await service.deleteRecord(envId);

    if (result.type === "error") {
      throw new Error("Something went wrong while deleting environment");
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
  attachListener(params: EnvironmentListenerParams): () => any {
    return () => {};
  }
}
