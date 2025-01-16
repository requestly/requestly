import { LocalScopeManager } from "modules/worker/localScopeManager";
import { SandboxAPI } from "./types";
import { VariableScope } from "./variableScope";
import { RQAPI } from "features/apiClient/types";

// unsupported methods
const createInfiniteChainable = (methodName: string) => {
  let hasLogged = false;

  const handler = {
    get: () => {
      if (!hasLogged) {
        console.log(`Using unsupported method: ${methodName}`);
        hasLogged = true;
      }
      return new Proxy(() => {}, handler);
    },
    apply: () => {
      return new Proxy(() => {}, handler);
    },
  };

  return new Proxy(() => {}, handler);
};

export class RQ implements SandboxAPI {
  public request: RQAPI.Request;
  public response: RQAPI.Response;
  public environment: VariableScope;
  public globals: VariableScope;
  public collectionVariables: VariableScope;

  // Add other sandbox properties
  public cookies = createInfiniteChainable("cookie");
  public execution = createInfiniteChainable("execution");
  public expect = createInfiniteChainable("expect");
  public info = createInfiniteChainable("info");
  public iterationData = createInfiniteChainable("iterationData");
  public require = createInfiniteChainable("require");
  public sendRequest = createInfiniteChainable("sendRequest");
  public test = createInfiniteChainable("test");
  public variables = createInfiniteChainable("variables");
  public vault = createInfiniteChainable("vault");
  public visualizer = createInfiniteChainable("visualizer");

  constructor(localScope: LocalScopeManager) {
    this.environment = new VariableScope(localScope, "environment");
    this.globals = new VariableScope(localScope, "global");
    this.collectionVariables = new VariableScope(localScope, "collectionVariables");
    this.request = localScope.get("request");
    let originalResponse = localScope.get("response");
    this.response = {
      ...originalResponse,
      code: originalResponse.status,
      status: originalResponse.statusText,
      responseTime: originalResponse.time,
    };
  }
}
