import { EnvironmentMap } from "backend/environment/types";

export interface InitialState {
  currentEnvironment: string;
  environments: EnvironmentMap;
}
