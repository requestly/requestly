import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientLocalMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { EnvironmentEntity, FileSystemResult } from "./types";
import { parseEntityVariables, parseFsId } from "../../utils";

export class LocalEnvSync implements EnvironmentInterface<ApiClientLocalMeta> {
  constructor(readonly meta: ApiClientLocalMeta) {}

  private async getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.meta.rootPath);
  }

  private parseEnvironmentEntitiesToMap(entities: EnvironmentEntity[]): EnvironmentMap {
    const environmentsMap = entities.reduce((acc, cur) => {
      const parsedId = parseFsId(cur.id);
      acc[cur.id] = {
        id: cur.id,
        externalId: parsedId,
        name: cur.name,
        variables: parseEntityVariables(cur?.variables || {}),
      };
      return acc;
    }, {} as EnvironmentMap);

    return environmentsMap;
  }

  private parseEnvironmentEntity(entity: EnvironmentEntity): EnvironmentData {
    const parsedId = parseFsId(entity.id);
    const environment: EnvironmentData = {
      id: entity.id,
      externalId: parsedId,
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
    if (result.type === "success") {
      const parsedEnv = this.parseEnvironmentEntity(result.content);
      return parsedEnv;
    }

    throw new Error("Something went wrong while create a new environment.");
  }

  async createGlobalEnvironment(): Promise<EnvironmentData> {
    const service = await this.getAdapter();
    const result: FileSystemResult<EnvironmentEntity> = await service.createEnvironment("Global Variables", true);
    if (result.type === "success") {
      const parsedEnv = this.parseEnvironmentEntity(result.content);
      return parsedEnv;
    }

    return null;
  }
  deleteEnvironment(envId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  removeVariableFromEnvironment(environmentId: string, key: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData> {
    throw new Error("Method not implemented.");
  }
  attachListener(params: EnvironmentListenerParams): () => any {
    return () => {};
  }
}
