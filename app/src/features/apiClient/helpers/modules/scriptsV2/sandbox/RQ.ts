import { LocalScope } from "modules/localScope";
import { SandboxAPI, TestFunction, TestResult } from "./types";
import { VariableScope } from "./variableScope";
import { RQAPI } from "features/apiClient/types";
import { expect } from "chai";
import { TestExecutor } from "./testExecutor";
import { verify } from "./utils";

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

type Response = RQAPI.Response & {
  code: number;
  status: string;
  responseTime: number;
};

export class RQ implements SandboxAPI {
  public request: RQAPI.Request;
  public response: Response;
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
        body: jsonifyObject(this.request.body),
      }),
    });

    if (this.response) {
      const self = this;
      Object.setPrototypeOf(this.response, {
        toJSON() {
          return {
            ...this,
            body: jsonifyObject(this.body),
          };
        },
        json: () => jsonifyObject(this.response.body),
        text: () => this.response.body,
        get to() {
          return {
            get be() {
              return {
                get accepted() {
                  return self.checkStatus(202, true);
                },
                get badRequest() {
                  return self.checkStatus(400, true);
                },
                get clientError() {
                  return self.checkStatus("4XX", true);
                },
                get error() {
                  return self.checkStatus(["4XX", "5XX"], true);
                },
                get forbidden() {
                  return self.checkStatus(403, true);
                },
                get info() {
                  return self.checkStatus("1XX", true);
                },
                get notFound() {
                  return self.checkStatus(404, true);
                },
                get ok() {
                  return self.checkStatus("2XX", true);
                },
                get rateLimited() {
                  return self.checkStatus(429, true);
                },
                get redirection() {
                  return self.checkStatus("3XX", true);
                },
                get serverError() {
                  return self.checkStatus("5XX", true);
                },
                get success() {
                  return self.checkStatus(200, true);
                },
                get unauthorized() {
                  return self.checkStatus(401, true);
                },
              };
            },
            get have() {
              return {
                body: (expected: string) => self.haveBody(expected, true),
                status: (expected: number | string) => self.haveStatus(expected, true),
                header: (expected: string) => self.haveHeader(expected, true),
                jsonBody: (expected: object) => self.haveJsonBody(expected, true),
              };
            },
            get not() {
              return {
                get be() {
                  return {
                    get accepted() {
                      return self.checkStatus(202, false);
                    },
                    get badRequest() {
                      return self.checkStatus(400, false);
                    },
                    get clientError() {
                      return self.checkStatus("4XX", false);
                    },
                    get error() {
                      return self.checkStatus(["4XX", "5XX"], false);
                    },
                    get forbidden() {
                      return self.checkStatus(403, false);
                    },
                    get info() {
                      return self.checkStatus("1XX", false);
                    },
                    get notFound() {
                      return self.checkStatus(404, false);
                    },
                    get ok() {
                      return self.checkStatus("2XX", false);
                    },
                    get rateLimited() {
                      return self.checkStatus(429, false);
                    },
                    get redirection() {
                      return self.checkStatus("3XX", false);
                    },
                    get serverError() {
                      return self.checkStatus("5XX", false);
                    },
                    get success() {
                      return self.checkStatus(200, false);
                    },
                    get unauthorized() {
                      return self.checkStatus(401, false);
                    },
                  };
                },
                get have() {
                  return {
                    body: (expected: string) => self.haveBody(expected, false),
                    status: (expected: number | string) => self.haveStatus(expected, false),
                    header: (expected: string) => self.haveHeader(expected, false),
                    jsonBody: (expected: object) => self.haveJsonBody(expected, false),
                  };
                },
              };
            },
          };
        },
      });
    }
  }

  private checkStatus = (expected: number | string | string[], checkEquality: boolean) => {
    if (typeof expected === "number") {
      try {
        verify(expected, this.response.code, checkEquality);
      } catch (e) {
        if (checkEquality) {
          throw Error(`expected response code to be ${expected} but got ${this.response.code}.`);
        }
        throw Error(`expected response code to not be ${expected} but got ${this.response.code}.`);
      }
    } else {
      const actualInitialDigit = this.response.code.toString().substring(0, 1);
      if (Array.isArray(expected)) {
        expected.forEach((status) => {
          const expectedInitialDigit = status.substring(0, 1);
          try {
            verify(expectedInitialDigit, actualInitialDigit, checkEquality);
          } catch (e) {
            if (checkEquality) {
              throw Error(`expected response code to be ${expected.join(" or ")} but got ${this.response.code}.`);
            }
            throw Error(`expected response code to not be ${expected.join(" or ")} but got ${this.response.code}.`);
          }
        });
      } else {
        const expectedInitialDigit = expected.substring(0, 1);
        try {
          verify(expectedInitialDigit, actualInitialDigit, checkEquality);
        } catch (e) {
          if (checkEquality) {
            throw Error(`expected response code to be ${expected} but got ${this.response.code}.`);
          }
          throw Error(`expected response code to not be ${expected} but got ${this.response.code}.`);
        }
      }
    }
  };

  private haveBody = (expected: string, checkEquality: boolean) => verify(this.response.body, expected, checkEquality);

  private haveStatus = (expected: number | string, checkEquality: boolean) => {
    if (typeof expected === "string") {
      verify(this.response.status, expected, checkEquality);
    } else {
      verify(this.response.code, expected, checkEquality);
    }
  };

  private haveHeader = (expected: string, checkEquality: boolean) => {
    const isHeaderFound =
      this.response.headers.find((header) => header.key.toLowerCase() === expected.toLowerCase()) !== undefined;
    try {
      verify(isHeaderFound, checkEquality, true);
    } catch (e) {
      if (checkEquality) {
        throw Error(`expected response to have header with key '${expected}'.`);
      }
      throw Error(`expected response to not have header with key '${expected}'.`);
    }
  };

  private haveJsonBody = (expected: object, checkEquality: boolean) => {
    const actualBody = jsonifyObject(this.response.body);
    try {
      verify(actualBody, expected, checkEquality);
    } catch (e) {
      if (checkEquality) {
        throw Error(`expected response to have json body.`);
      }
      throw Error(`expected response to not have json body.`);
    }
  };
}
