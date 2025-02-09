import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientCloudMeta, EnvironmentInterface } from "../../interfaces";
import {
  createNonGlobalEnvironmentInDB,
  deleteEnvironmentFromDB,
  duplicateEnvironmentInDB,
  removeEnvironmentVariableFromDB,
  updateEnvironmentInDB,
} from "backend/environment";
import { getOwnerId } from "backend/utils";

export class FirebaseEnvSync implements EnvironmentInterface<ApiClientCloudMeta> {
  meta: ApiClientCloudMeta;

  constructor(metadata: ApiClientCloudMeta) {
    this.meta = metadata;
  }

  private getPrimaryId() {
    return getOwnerId(this.meta.uid, this.meta.teamId);
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

  async removeVariableFromEnvironment(environmentId: string, key: string): Promise<void> {
    await removeEnvironmentVariableFromDB(this.getPrimaryId(), { environmentId, key });
  }

  async updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void> {
    await updateEnvironmentInDB(this.getPrimaryId(), environmentId, updates);
  }
}
