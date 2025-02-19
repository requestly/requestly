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

  private parseEnvironmentEntities(entities: EnvironmentEntity[]): EnvironmentMap {
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

  async getAllEnvironments() {
    const service = await this.getAdapter();
    const result: FileSystemResult<EnvironmentEntity[]> = await service.getAllEnvironments();
    if (result.type === "success") {
      const parsedEnvs = this.parseEnvironmentEntities(result.content);
      return parsedEnvs;
    } else {
      return {};
    }
  }

  createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData> {
    throw new Error("Method not implemented.");
  }
  createGlobalEnvironment(): Promise<EnvironmentData> {
    throw new Error("Method not implemented.");
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
