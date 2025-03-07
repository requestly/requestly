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
import { ErrorFile } from "../../local/services/types";

export class FirebaseEnvSync implements EnvironmentInterface<ApiClientCloudMeta> {
  meta: ApiClientCloudMeta;

  constructor(metadata: ApiClientCloudMeta) {
    this.meta = metadata;
  }

  private getPrimaryId() {
    return getOwnerId(this.meta.uid, this.meta.teamId);
  }

  async getAllEnvironments(): Promise<{
    success: boolean;
    data: { environments: EnvironmentMap; errorFiles: ErrorFile[] };
  }> {
    const result = await fetchAllEnvironmentDetails(this.getPrimaryId());
    return {
      success: true,
      data: {
        environments: result,
        errorFiles: [] as ErrorFile[],
      },
    };
  }

  async deleteEnvironment(envId: string): Promise<void> {
    await deleteEnvironmentFromDB(this.getPrimaryId(), envId);
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
