import { EnvironmentData, EnvironmentMap, VariableScope } from "backend/environment/types";
import { ApiClientCloudMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";
import {
  attachCollectionVariableListener,
  attachEnvironmentVariableListener,
  createNonGlobalEnvironmentInDB,
  deleteEnvironmentFromDB,
  duplicateEnvironmentInDB,
  fetchAllEnvironmentDetails,
  updateEnvironmentInDB,
} from "backend/environment";
import { getOwnerId } from "backend/utils";
import { ErroredRecords } from "../../local/services/types";

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
    return {
      success: true,
      data: {
        environments: result,
        erroredRecords: [] as ErroredRecords[],
      },
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

  async duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData> {
    return duplicateEnvironmentInDB(this.getPrimaryId(), environmentId, allEnvironments);
  }

  async updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void> {
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
