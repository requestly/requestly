import { LocalScope } from "modules/localScope";
import { SandboxAPI, TestFunction, TestResult } from "./types";
import { VariableScope } from "./variableScope";
import { RQAPI } from "features/apiClient/types";
import { expect } from "chai";
import { TestExecutor } from "./testExecutor";

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
  public expect: Chai.ExpectStatic;
  public test: TestFunction;

  // Add other sandbox properties
  public cookies = createInfiniteChainable("cookie");
  public execution = createInfiniteChainable("execution");
  public info = createInfiniteChainable("info");
  public iterationData = createInfiniteChainable("iterationData");
  public require = createInfiniteChainable("require");
  public sendRequest = createInfiniteChainable("sendRequest");
  public variables = createInfiniteChainable("variables");
  public vault = createInfiniteChainable("vault");
  public visualizer = createInfiniteChainable("visualizer");

  constructor(localScope: LocalScope, private testResults: TestResult[]) {
    this.environment = new VariableScope(localScope, "environment");
    this.globals = new VariableScope(localScope, "global");
    this.collectionVariables = new VariableScope(localScope, "collectionVariables");
    this.expect = expect;
    this.test = Object.assign(
      (testName: string, testFn: () => void) => {
        const result = new TestExecutor().execute(testName, testFn);
        this.testResults.push(result);
      },
      {
        skip: (testName: string) => {
          const result = new TestExecutor().skip(testName);
          this.testResults.push(result);
        },
      }
    );
    this.request = localScope.get("request");
    let originalResponse = localScope.get("response");
    this.response = originalResponse
      ? {
          ...originalResponse,
          code: originalResponse.status,
          status: originalResponse.statusText,
          responseTime: originalResponse.time,
        }
      : undefined;

    Object.setPrototypeOf(this.request, {
      toJSON: () => ({
        method: this.request.method,
        url: this.request.url,
        body: this.request.body,
      }),
    });

    if (this.response) {
      Object.setPrototypeOf(this.response, {
        toJSON() {
          return {
            ...this,
            body: this.body,
          };
        },
        json: () => this.response.body,
        text: () => this.response.body,
      });
    }
  }
}
