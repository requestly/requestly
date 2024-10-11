import { EnvironmentVariable } from "backend/environment/types";

export interface InitialState {
  currentEnvironment: EnvironmentDetails;
  variables: EnvironmentVariable;
}

export interface EnvironmentDetails {
  name: string;
}
