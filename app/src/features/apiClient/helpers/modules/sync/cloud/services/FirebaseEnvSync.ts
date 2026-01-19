import { EnvironmentData, EnvironmentMap, VariableScope } from "backend/environment/types";
import { ApiClientCloudMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import {
  attachCollectionVariableListener,
  attachEnvironmentVariableListener,
  createNonGlobalEnvironmentInDB,
  deleteEnvironmentFromDB,
  duplicateEnvironmentInDB,
  fetchAllEnvironmentDetails,
  getEnvironment,
  updateEnvironmentInDB,
} from "backend/environment";
import { getOwnerId } from "backend/utils";
import { ErroredRecord } from "../../local/services/types";

export class FirebaseEnvSync implements EnvironmentInterface<ApiClientCloudMeta> {
  meta: ApiClientCloudMeta;

  constructor(metadata: ApiClientCloudMeta) {
    this.meta = metadata;
  }

  private getPrimaryId() {
    return getOwnerId(this.meta.uid, this.meta.teamId);
  }

  async getAllEnvironments() {
    const result = await fetchAllEnvironmentDetails(this.getPrimaryId());

    if (!result) {
      return {
        success: false,
        data: {
          environments: {},
          erroredRecords: [] as ErroredRecord[],
        },
      };
    }

    return {
      success: true,
      data: {
        environments: result,
        erroredRecords: [] as ErroredRecord[],
      },
    };
  }

  async getEnvironmentById(envId: string) {
    const result = await getEnvironment(envId, this.getPrimaryId());
    return {
      success: true,
      data: result,
    };
  }

  async deleteEnvironment(envId: string) {
    try {
      await deleteEnvironmentFromDB(this.getPrimaryId(), envId);
      return { success: true };
    } catch (e) {
      return { success: false, message: "Something went wrong while deleting the environment" };
    }
  }
  async createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData> {
    return createNonGlobalEnvironmentInDB(this.getPrimaryId(), environmentName);
  }
  async createGlobalEnvironment(): Promise<EnvironmentData> {
    return createNonGlobalEnvironmentInDB(this.getPrimaryId(), "Global Environment");
  }

  async createEnvironments(environments: EnvironmentData[]): Promise<EnvironmentData[]> {
    if (environments.length === 0) {
      return [];
    }

    const promises = environments.map(async (env) => {
      return this.createNonGlobalEnvironment(env.name).then((envData) => {
        this.updateEnvironment(envData.id, { variables: env.variables });
        return envData;
      });
    });

    return Promise.all(promises);
  }

  async duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData> {
    return duplicateEnvironmentInDB(this.getPrimaryId(), environmentId, allEnvironments);
  }

  async updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables" | "variablesOrder">>
  ): Promise<void> {
    if (updates.variables) {
      updates.variables = Object.fromEntries(Object.entries(updates.variables).filter(([key]) => key !== ""));
    }
    await updateEnvironmentInDB(this.getPrimaryId(), environmentId, updates);
  }

  getGlobalEnvironmentId() {
    return "global";
  }

  attachListener(params: EnvironmentListenerParams) {
    if (params.scope === VariableScope.COLLECTION) {
      return attachCollectionVariableListener(this.getPrimaryId(), params.callback);
    }

    return attachEnvironmentVariableListener(this.getPrimaryId(), params.id, params.callback);
  }
}
