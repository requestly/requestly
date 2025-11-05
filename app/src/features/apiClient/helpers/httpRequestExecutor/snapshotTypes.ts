import { EnvironmentVariables } from "backend/environment/types";
import { RuntimeVariables } from "features/apiClient/store/runtimeVariables/utils";
import { RQAPI } from "features/apiClient/types";

export type BaseSnapshot = {
  global: EnvironmentVariables;
  collectionVariables: EnvironmentVariables;
  environment: EnvironmentVariables;
  variables: RuntimeVariables;
  iterationData: EnvironmentVariables;
};

export type SnapshotForPreRequest = BaseSnapshot & {
  request: RQAPI.Request;
};

export type SnapshotForPostResponse = BaseSnapshot & {
  request: RQAPI.Request;
  response: RQAPI.Response;
};
