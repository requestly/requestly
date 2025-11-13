import { RQAPI } from "features/apiClient/types";
import { Options as AjvOptions } from "ajv";
import { IterationData } from "./IterationData";
import { VariableScope } from "./variableScope";

interface StatusAssertions {
  accepted: void;
  badRequest: void;
  clientError: void;
  error: void;
  forbidden: void;
  info: void;
  notFound: void;
  ok: void;
  rateLimited: void;
  redirection: void;
  serverError: void;
  success: void;
  unauthorized: void;
}

export type LocalScopeRequest = RQAPI.Request & {
  toJSON: () => {
    method: string;
    url: string;
    body: object;
  };
};

interface HaveJsonBody {
  jsonBody(): void;
  jsonBody(path: string): void;
  jsonBody(path: string, value: any): void;
}

export type LocalScopeResponse =
  | (RQAPI.Response & {
      code: number;
      status: string;
      responseTime: number;
      toJSON: () => {
        body: object;
        [key: string]: any;
      };
      json: () => object;
      text: () => string;
      to: {
        be: StatusAssertions;
        have: {
          body: (expectedValue: string) => void;
          status: (expectedValue: number | string) => void;
          header: (expectedValue: string) => void;
          jsonSchema: (schema: any, ajvOptions?: AjvOptions) => void;
          jsonBody: HaveJsonBody;
        };
        not: {
          be: StatusAssertions;
          have: {
            body: (expectedValue: string) => void;
            status: (expectedValue: number | string) => void;
            header: (expectedValue: string) => void;
            jsonSchema: (schema: any, ajvOptions?: AjvOptions) => void;
            jsonBody: HaveJsonBody;
          };
        };
      };
    })
  | undefined;

export type ExecutionArtifacts = {
  testResults: TestResult[];
};

export type InfoObject = {
  requestId: string;
  eventName: "prerequest" | "postresponse";
  iteration: number;
  iterationCount: number;
  requestName: string;
};

export interface TestFunction {
  (testName: string, testFn: () => void): void;
  skip: (testName: string) => void;
}

export interface SandboxAPI {
  request: LocalScopeRequest;
  response: LocalScopeResponse;
  environment: VariableScope;
  globals: VariableScope;
  collectionVariables: VariableScope;
  variables: VariableScope;
  iterationData: IterationData;
  test: TestFunction;
  expect: Chai.ExpectStatic;
  info: InfoObject;
  cookies: any;
  execution: any;
  require: any;
  sendRequest: any;
  vault: any;
  visualizer: any;
}

export enum TestStatus {
  PASSED = "passed",
  FAILED = "failed",
  SKIPPED = "skipped",
}

export interface BaseTestResult {
  name: string;
  status: TestStatus;
}

export interface PassedTestResult extends BaseTestResult {
  status: TestStatus.PASSED;
}

export interface FailedTestResult extends BaseTestResult {
  status: TestStatus.FAILED;
  error: string;
}

export interface SkippedTestResult extends BaseTestResult {
  status: TestStatus.SKIPPED;
}

export type TestResult = PassedTestResult | FailedTestResult | SkippedTestResult;

export type IterationContext = {
  iteration: number;
  iterationCount: number;
};

export type BaseExecutionMetadata = {
  requestId: string;
  requestName: string;
  iterationContext: IterationContext;
};

export type ExecutionMetadata = BaseExecutionMetadata & {
  eventName: "prerequest" | "postresponse";
};
