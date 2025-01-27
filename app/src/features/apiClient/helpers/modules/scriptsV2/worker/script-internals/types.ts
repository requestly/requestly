import { VariableValueType } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import { Options as AjvOptions } from "ajv";

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
          jsonSchema: (schema: string, ajvOptions?: AjvOptions) => void;
          jsonBody: (expectedValue?: string | object, value?: any) => void;
        };
        not: {
          be: StatusAssertions;
          have: {
            body: (expectedValue: string) => void;
            status: (expectedValue: number | string) => void;
            header: (expectedValue: string) => void;
            jsonSchema: (schema: string, ajvOptions?: AjvOptions) => void;
            jsonBody: (expectedValue?: string | object, value?: any) => void;
          };
        };
      };
    })
  | undefined;

export type ExecutionArtifacts = {
  testResults: TestResult[];
};

export interface TestFunction {
  (testName: string, testFn: () => void): void;
  skip: (testName: string) => void;
}

export interface SandboxAPI {
  request: LocalScopeRequest;
  response: LocalScopeResponse;
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
  test: TestFunction;
  expect: Chai.ExpectStatic;
  cookies: any;
  execution: any;
  info: any;
  iterationData: any;
  require: any;
  sendRequest: any;
  variables: any;
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
