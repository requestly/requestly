import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";

export interface InitialState {
  currentEnvironment: string;
  environments: EnvironmentMap;
  api_collections: {
    [key: string]: {
      variables: EnvironmentVariables;
    };
  };
}
