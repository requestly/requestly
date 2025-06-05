import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";

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
  errorEnvFiles: ErroredRecord[];
}
