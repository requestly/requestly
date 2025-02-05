import { EnvironmentData, EnvironmentMap } from "backend/environment/types";

export interface EnvironmentInterface {
  ownerId: string;
  createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData>;
  createGlobalEnvironment(): Promise<EnvironmentData>;
  deleteEnvironment(envId: string): Promise<void>;
  updateEnvironment(
    environmentId: string,
    updates: Partial<Pick<EnvironmentData, "name" | "variables">>
  ): Promise<void>;
  removeVariableFromEnvironment(environmentId: string, key: string): Promise<void>;
  duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData>;
}

export interface ApiClientRepositoryInterface {
  environmentVariablesRepository: EnvironmentInterface;
}
