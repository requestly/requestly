import { EnvironmentData, EnvironmentMap } from "backend/environment/types";

export interface InitialState {
  currentEnvironment: Omit<EnvironmentData, "variables">;
  environments: EnvironmentMap;
}
