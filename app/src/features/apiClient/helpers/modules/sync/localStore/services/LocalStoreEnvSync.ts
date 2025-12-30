import { withTimeout, Mutex } from "async-mutex";
import { EnvironmentData, EnvironmentMap, VariableScope } from "backend/environment/types";
import { ApiClientLocalStoreMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import { ErroredRecord } from "../../local/services/types";
import { v4 as uuidv4 } from "uuid";
import { ApiClientLocalDbQueryService } from "../helpers";
import { ApiClientLocalDbTable } from "../helpers/types";
import dbProvider from "../helpers/ApiClientLocalDbProvider";
import { CollectionVariableMap, RQAPI } from "features/apiClient/types";

const createGlobalEnvironmentLock = withTimeout(new Mutex(), 10 * 1000);

export class LocalStoreEnvSync implements EnvironmentInterface<ApiClientLocalStoreMeta> {
  meta: ApiClientLocalStoreMeta;
  private queryService: ApiClientLocalDbQueryService<EnvironmentData>;

  constructor(meta: ApiClientLocalStoreMeta) {
    this.meta = meta;
    this.queryService = new ApiClientLocalDbQueryService<EnvironmentData>(meta, ApiClientLocalDbTable.ENVIRONMENTS);
    this.createGlobalEnvironment();
  }

  private getNewId() {
    return uuidv4();
  }

  async getAllEnvironments() {
    const environments = await this.queryService.getRecords();
    const environmentsMap = (environments ?? []).reduce((result, env) => {
      result[env.id] = env;
      return result;
    }, {} as EnvironmentMap);

    const globalId = this.getGlobalEnvironmentId();
    if (!environmentsMap[globalId]) {
      environmentsMap[globalId] = await this.createGlobalEnvironment();
    }

    return {
      success: true,
      data: {
        environments: environmentsMap,
        erroredRecords: [] as ErroredRecord[],
      },
    };
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

  async _getAllEnvironments() {
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

    const release = await createGlobalEnvironmentLock.acquire();
    try {
      const globalEnv = await this.queryService.getRecord(this.getGlobalEnvironmentId());
      if (globalEnv) {
        return globalEnv;
      }

      await this.queryService.createRecord(newEnvironment);
      return newEnvironment;
    } finally {
      release();
    }
  }

  async createEnvironments(environments: EnvironmentData[]): Promise<EnvironmentData[]> {
    const environmentsWithIds = environments.map((env) => {
      return { ...env, id: env.id || this.getNewId() };
    });

    await this.queryService.createBulkRecords(environmentsWithIds);
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
        environment.variables = { ...updates.variables };
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

  /**
   * We are esseentially mocking the Firebase listener here.
   * This is done for all variable scopes because firebase listener
   * also does this, which is bad. Ideally a repo should not be making
   * raw queries to the database, let alone other databases.
   *
   * FIXME: This is a temporary solution to mock the Firebase listener.
   */
  attachListener(params: EnvironmentListenerParams): () => void {
    const dbInstance = dbProvider.get(this.meta);

    (async () => {
      if (params.scope === VariableScope.COLLECTION) {
        const collections = await dbInstance.db
          .table<RQAPI.CollectionRecord>(ApiClientLocalDbTable.APIS)
          .toArray((records) => records.filter((r) => r.type === RQAPI.RecordType.COLLECTION));

        const collectionVariableMap: CollectionVariableMap = {};
        collections.forEach((record) => {
          collectionVariableMap[record.id] = { variables: record.data.variables || {} };
        });

        params.callback(collectionVariableMap);
        return;
      }

      if (params.scope === VariableScope.ENVIRONMENT || params.scope === VariableScope.GLOBAL) {
        const env = await this.queryService.getRecord(params.id);

        if (!env) {
          return;
        }

        params.callback(env);
        return;
      }
    })();

    return () => {};
  }

  async clear() {
    await this.queryService.clearAllRecords();
  }

  async getIsAllCleared(): Promise<boolean> {
    return this.queryService.getIsAllCleared();
  }
}
