import { EnvironmentVariables } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

export type BaseSnapshot = {
  global: EnvironmentVariables;
  collection: EnvironmentVariables;
  environment: EnvironmentVariables;
};

export type SnapshotForPreRequest = BaseSnapshot & {
  request: RQAPI.Request;
};

export type SnapshotForPostResponse = BaseSnapshot & {
  request: RQAPI.Request;
  response: RQAPI.Response;
};
