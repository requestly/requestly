import { LocalScope } from "modules/localScope";
import { LocalScopeRequest, LocalScopeResponse, SandboxAPI, TestFunction, TestResult } from "./types";
import { VariableScope } from "./variableScope";
import { RQAPI } from "features/apiClient/types";
import { expect } from "chai";
import { Options as AjvOptions } from "ajv";
import { TestExecutor } from "./testExecutor";
import { AssertionHandler } from "./assertionHandler";
import { status } from "http-status";

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

const jsonifyObject = (objectString: unknown) => {
  if (objectString && typeof objectString === "object") {
    return objectString;
  }

  try {
    return JSON.parse(objectString as string);
  } catch {
    throw Error("Invalid JSON");
  }
};

export class RQ implements SandboxAPI {
  public request: LocalScopeRequest;
  public response: LocalScopeResponse;
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

  private assertionHandler: AssertionHandler;

  constructor(localScope: LocalScope, private testResults: TestResult[]) {
    this.environment = new VariableScope(localScope, "environment");
    this.globals = new VariableScope(localScope, "global");
    this.collectionVariables = new VariableScope(localScope, "collectionVariables");
    this.expect = expect;
    this.test = this.createTestObject();
    this.request = this.createRequestObject(localScope.get("request"));
    this.response = this.createResponseObject(localScope.get("response"));

    this.assertionHandler = new AssertionHandler(this.response);
  }

  private createTestObject(): TestFunction {
    return Object.assign(
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
  }

  private createRequestObject(originalRequest: RQAPI.Request): LocalScopeRequest {
    return Object.create(
      {
        toJSON: () => ({
          method: originalRequest.method,
          url: originalRequest.url,
          body: jsonifyObject(originalRequest.body),
        }),
      },
      Object.getOwnPropertyDescriptors(originalRequest)
    );
  }

  private createResponseObject(originalResponse: RQAPI.Response): LocalScopeResponse {
    if (!originalResponse) {
      return (this.response = undefined);
    }
    const responseProperties = {
      ...originalResponse,
      code: originalResponse.status,
      status: originalResponse.statusText || (status as { [key: number]: string })[originalResponse.status], // type casting is necessary otherwise ts complains that type number cannot be used to index status
      responseTime: originalResponse.time,
    };

    return Object.create(
      {
        toJSON: () => {
          return {
            ...responseProperties,
            body: jsonifyObject(originalResponse.body),
          };
        },
        json: () => jsonifyObject(originalResponse.body),
        text: () => this.response.body,
        to: {
          be: this.createBeAssertions(true),
          have: this.createHaveAssertions(true),
          not: {
            be: this.createBeAssertions(false),
            have: this.createHaveAssertions(false),
          },
        },
      },
      Object.getOwnPropertyDescriptors(responseProperties)
    );
  }

  private createBeAssertions(isEqualityCheck: boolean) {
    const statusCodes = {
      accepted: 202,
      badRequest: 400,
      clientError: "4XX",
      error: ["4XX", "5XX"],
      forbidden: 403,
      info: "1XX",
      notFound: 404,
      ok: "2XX",
      rateLimited: 429,
      redirection: "3XX",
      serverError: "5XX",
      success: 200,
      unauthorized: 401,
    };

    return Object.defineProperties(
      {},
      Object.entries(statusCodes).reduce(
        (acc, [key, code]) => ({
          ...acc,
          [key]: {
            get: () => this.assertionHandler.checkStatus(code, isEqualityCheck),
            enumerable: true,
          },
        }),
        {}
      )
    );
  }

  private createHaveAssertions(isEqualityCheck: boolean) {
    return {
      body: (expectedValue: string) => this.assertionHandler.haveBody(expectedValue, isEqualityCheck),
      status: (expectedValue: number | string) => this.assertionHandler.haveStatus(expectedValue, isEqualityCheck),
      header: (expectedValue: string) => this.assertionHandler.haveHeader(expectedValue, isEqualityCheck),
      jsonSchema: (schema: any, ajvOptions?: AjvOptions) =>
        this.assertionHandler.haveJsonSchema(schema, isEqualityCheck, ajvOptions),
      jsonBody: (path?: string, value?: any) => this.assertionHandler.haveJsonBody(path, isEqualityCheck, value),
    };
  }
}
