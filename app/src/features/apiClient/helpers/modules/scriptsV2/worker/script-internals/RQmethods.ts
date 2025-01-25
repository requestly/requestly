import { LocalScope } from "modules/localScope";
import { LocalScopeResponse, SandboxAPI, TestFunction, TestResult } from "./types";
import { VariableScope } from "./variableScope";
import { RQAPI } from "features/apiClient/types";
import { expect } from "chai";
import { TestExecutor } from "./testExecutor";
import { AssertionHandler } from "./assertionHandler";

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

  return JSON.parse(objectString as string);
};

export class RQ implements SandboxAPI {
  public request: RQAPI.Request;
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

  private jsonResponseBody: Response;
  private assertionHandler: AssertionHandler;

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
    if (this.response) {
      this.jsonResponseBody = jsonifyObject(this.response.body);
    }
    this.assertionHandler = new AssertionHandler(this.response);

    Object.setPrototypeOf(this.request, {
      toJSON: () => ({
        method: this.request.method,
        url: this.request.url,
        body: jsonifyObject(this.request.body),
      }),
    });

    if (this.response) {
      const self = this;
      Object.setPrototypeOf(this.response, {
        toJSON() {
          return {
            ...this,
            body: self.jsonResponseBody,
          };
        },
        json: () => self.jsonResponseBody,
        text: () => this.response.body,
        to: {
          be: self.createBeAssertions(true),
          have: self.createHaveAssertions(true),
          not: {
            be: self.createBeAssertions(false),
            have: self.createHaveAssertions(false),
          },
        },
      });
    }
  }

  private createBeAssertions(isEqualityCheck: boolean) {
    const checkStatus = this.assertionHandler.checkStatus.bind(this);

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
            get: () => checkStatus(code, isEqualityCheck),
            enumerable: true,
          },
        }),
        {}
      )
    );
  }

  private createHaveAssertions(isEqualityCheck: boolean) {
    const haveBody = this.assertionHandler.haveBody.bind(this);
    const haveStatus = this.assertionHandler.haveStatus.bind(this);
    const haveHeader = this.assertionHandler.haveHeader.bind(this);

    return {
      body: (expectedValue: string) => haveBody(expectedValue, isEqualityCheck),
      status: (expectedValue: number | string) => haveStatus(expectedValue, isEqualityCheck),
      header: (expectedValue: string) => haveHeader(expectedValue, isEqualityCheck),
    };
  }
}
