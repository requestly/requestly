import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientLocalMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";
import { EnvironmentEntity, FileSystemResult } from "./types";
import { parseEntityVariables } from "../../utils";
import { NativeError } from "errors/NativeError";

export class LocalEnvSync implements EnvironmentInterface<ApiClientLocalMeta> {
  private globalId?: string;
  constructor(readonly meta: ApiClientLocalMeta) {}

  private async getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.meta.rootPath);
  }

  private setGlobalId(id: string) {
    if(!this.globalId) {
      this.globalId = id;
    }
  }

  private parseEnvironmentEntitiesToMap(entities: EnvironmentEntity[]): EnvironmentMap {
    const environmentsMap = entities.reduce((acc, cur) => {
      acc[cur.id] = {
        id: cur.id,
        name: cur.name,
        variables: parseEntityVariables(cur?.variables || {}),
      };
      if(cur.isGlobal) {
        this.setGlobalId(cur.id);
      }
      return acc;
    }, {} as EnvironmentMap);

    return environmentsMap;
  }

  private parseEnvironmentEntity(entity: EnvironmentEntity): EnvironmentData {
    const environment: EnvironmentData = {
      id: entity.id,
      name: entity.name,
      variables: parseEntityVariables(entity?.variables || {}),
    };

    if(entity.isGlobal) {
      this.setGlobalId(entity.id);
    }

    return environment;
  }

  async getAllEnvironments() {
    const service = await this.getAdapter();
    const result = await service.getAllEnvironments();
    if (result.type === "success") {
      const parsedEnvs = this.parseEnvironmentEntitiesToMap(result.content.environments);
      try {
        this.getGlobalEnvironmentId();
      } catch(e) {
        const globalEnv = await this.createGlobalEnvironment();
        this.setGlobalId(globalEnv.id);
        
        parsedEnvs[globalEnv.id] = globalEnv;
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
      throw new Error(result.error.message || "Something went wrong while create a new environment.");
    }
    const parsedEnv = this.parseEnvironmentEntity(result.content);
    return parsedEnv;
  }

  async createGlobalEnvironment(): Promise<EnvironmentData> {
    const service = await this.getAdapter();
    const result: FileSystemResult<EnvironmentEntity> = await service.createEnvironment("Global Variables", true);
    if (result.type === "error") {
      throw new Error(result.error.message || "Something went wrong while creating the global environment.");
    }
    const parsedEnv = this.parseEnvironmentEntity(result.content);
    return parsedEnv;
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
    if(!this.globalId) {
      throw new NativeError('Global environment id has not been set yet!');
    }
    return this.globalId;
  }

  attachListener(params: EnvironmentListenerParams): () => any {
    return () => {};
  }
}
