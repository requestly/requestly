import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";

export interface InitialState {
  currentEnvironment: string;
  environments: {
    [ownerId: string]: EnvironmentMap;
  };
  api_collections: {
    [collectionId: string]: {
      variables: EnvironmentVariables;
    };
  };
}
