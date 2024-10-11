import { EnvironmentData, EnvironmentMap } from "backend/environment/types";

export interface InitialState {
  currentEnvironment: EnvironmentData;
  environments: EnvironmentMap;
}
