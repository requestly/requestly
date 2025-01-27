import { VariableValueType } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

export type LocalScopeResponse = RQAPI.Response & {
  code: number;
  status: string;
  responseTime: number;
};

export type ExecutionArtifacts = {
  testResults: TestResult[];
};

export interface TestFunction {
  (testName: string, testFn: () => void): void;
  skip: (testName: string) => void;
}

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
  test: TestFunction;
  cookies: any;
  execution: any;
  expect: any;
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
