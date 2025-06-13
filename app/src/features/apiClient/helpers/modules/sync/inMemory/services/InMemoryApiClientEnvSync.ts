import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientInMemoryMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { uuidv4 } from "@firebase/util";

export class InMemoryEnvSync implements EnvironmentInterface<ApiClientInMemoryMeta> {
  private store: EnvironmentMap;

  constructor(readonly meta: ApiClientInMemoryMeta) {
    this.store = meta.environments;
  }

  async getAllEnvironments() {
    return {
      success: true,
      data: {
        environments: this.store,
        erroredRecords: [] as any[],
      },
    };
  }

  async createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData> {
    const id = uuidv4();
    const data: EnvironmentData = {
      id,
      name: environmentName,
      variables: {},
    };
    this.store[id] = data;
    return data;
  }

  async createGlobalEnvironment(): Promise<EnvironmentData> {
    const id = "global";
    const data: EnvironmentData = {
      id,
      name: "Global Environment",
      variables: {},
    };
    this.store[id] = data;
    return data;
  }

  async deleteEnvironment(envId: string) {
    delete this.store[envId];
    return { success: true };
  }

  async updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void> {
    if (!this.store[environmentId]) {
      return;
    }

    this.store[environmentId] = {
      ...this.store[environmentId],
      ...updates,
    }
  }

  async duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData> {
    if (!this.store[environmentId]) {
      return;
    }
    const newId = uuidv4();
    const data: EnvironmentData = {
      ...this.store[environmentId],
      id: newId,
    };
    this.store[newId] = data;
    return data;
  }

  getGlobalEnvironmentId(): string {
    return "global";
  }

  attachListener(params: EnvironmentListenerParams): () => any {
    return () => {};
  }
}
