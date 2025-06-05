import { SkippedTestResult, TestResult, TestStatus } from "./types";

export class TestExecutor {
  execute(name: string, testFunction: () => void): TestResult {
    try {
      testFunction();
      return {
        name,
        status: TestStatus.PASSED,
      };
    } catch (error) {
      return {
        name,
        status: TestStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  skip(name: string): SkippedTestResult {
    return {
      name,
      status: TestStatus.SKIPPED,
    };
  }
}
