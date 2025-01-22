import { VariableValueType } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

export interface SandboxAPI {
  request: RQAPI.Request;
  response: RQAPI.Response;
  environment: {
    set(key: string, value: VariableValueType): void;
    get(key: string): any;
    unset(key: string): void;
  };
  globals: {
    set(key: string, value: VariableValueType): void;
    get(key: string): any;
    unset(key: string): void;
  };
  collectionVariables: {
    set(key: string, value: VariableValueType): void;
    get(key: string): any;
    unset(key: string): void;
  };
  cookies: any;
  execution: any;
  expect: any;
  info: any;
  iterationData: any;
  require: any;
  sendRequest: any;
  test: any;
  variables: any;
  vault: any;
  visualizer: any;
}
