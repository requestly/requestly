import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { EnvironmentInterface } from "../../interfaces";
import {
  createNonGlobalEnvironmentInDB,
  deleteEnvironmentFromDB,
  duplicateEnvironmentInDB,
  removeEnvironmentVariableFromDB,
  updateEnvironmentInDB,
} from "backend/environment";

export class FirebaseEnvSync implements EnvironmentInterface {
  ownerId: string;

  constructor(ownerId: string) {
    this.ownerId = ownerId;
  }

  async deleteEnvironment(envId: string): Promise<void> {
    await deleteEnvironmentFromDB(this.ownerId, envId);
  }
  async createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData> {
    return createNonGlobalEnvironmentInDB(this.ownerId, environmentName);
  }
  async createGlobalEnvironment(): Promise<EnvironmentData> {
    return createNonGlobalEnvironmentInDB(this.ownerId, "Global Environment");
  }

  async duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData> {
    return duplicateEnvironmentInDB(this.ownerId, environmentId, allEnvironments);
  }

  async removeVariableFromEnvironment(environmentId: string, key: string): Promise<void> {
    await removeEnvironmentVariableFromDB(this.ownerId, { environmentId, key });
  }

  async updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void> {
    await updateEnvironmentInDB(this.ownerId, environmentId, updates);
  }
}
