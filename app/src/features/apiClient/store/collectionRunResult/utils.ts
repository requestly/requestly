import { TestResult, TestStatus } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";
import { Iteration, RequestExecutionResult, RunResultState } from "./runResult.store";
import { RQAPI } from "features/apiClient/types";

export function getTestSummary(result: RequestExecutionResult) {
  let success: TestResult[] = [];
  let failed: TestResult[] = [];
  let skipped: TestResult[] = [];

  result.testResults?.forEach((test) => {
    if (test.status === TestStatus.PASSED) {
      success.push(test);
    } else if (test.status === TestStatus.FAILED) {
      failed.push(test);
    } else {
      skipped.push(test);
    }
  });

  return { total: result.testResults ?? [], success, failed, skipped };
}

export type TestSummary = Map<
  Iteration,
  { requestExecutionResult: RequestExecutionResult; testResults: TestResult[] }[]
>;

export function getRunMetrics(results: RunResultState["iterations"]) {
  const allResults: RequestExecutionResult[] = [];
  for (const iterationDetails of results.values()) {
    allResults.push(...iterationDetails.result);
  }

  let totalDuration = 0;
  let totalResponseTime = 0;
  allResults.forEach((executionResult) => {
    if (executionResult.status.value === RQAPI.ExecutionStatus.SUCCESS && executionResult.testResults) {
      totalDuration += executionResult.runDuration ?? 0;
      totalResponseTime += executionResult.entry.responseTime ?? 0;
    }
  });

  return { totalDuration, avgResponseTime: allResults.length ? Math.round(totalResponseTime / allResults.length) : 0 };
}

export function getAllTestSummary(result: RunResultState["iterations"]) {
  const allResults: RequestExecutionResult[] = [];
  for (const iterationDetails of result.values()) {
    allResults.push(...iterationDetails.result);
  }

  let totalTestsCounts = 0;
  let successTestsCounts = 0;
  let failedTestsCounts = 0;
  let skippedTestsCounts = 0;

  const totalTests: TestSummary = new Map();
  const successTests: TestSummary = new Map();
  const failedTests: TestSummary = new Map();
  const skippedTests: TestSummary = new Map();
  let totalDuration = 0;

  allResults.forEach((executionResult) => {
    const { iteration } = executionResult;
    const { total, success, failed, skipped } = getTestSummary(executionResult);
    totalTestsCounts += total.length;
    successTestsCounts += success.length;
    failedTestsCounts += failed.length;
    skippedTestsCounts += skipped.length;
    totalDuration += executionResult.runDuration;

    totalTests.set(iteration, [
      ...(totalTests.get(iteration) ?? []),
      { requestExecutionResult: executionResult, testResults: total },
    ]);

    successTests.set(iteration, [
      ...(successTests.get(iteration) ?? []),
      { requestExecutionResult: executionResult, testResults: success },
    ]);

    failedTests.set(iteration, [
      ...(failedTests.get(iteration) ?? []),
      { requestExecutionResult: executionResult, testResults: failed },
    ]);

    skippedTests.set(iteration, [
      ...(skippedTests.get(iteration) ?? []),
      { requestExecutionResult: executionResult, testResults: skipped },
    ]);
  });

  return {
    allResults: result,
    iterations: result.size,
    totalTests,
    successTests,
    failedTests,
    skippedTests,
    totalTestsCounts,
    successTestsCounts,
    failedTestsCounts,
    skippedTestsCounts,
    duration: totalDuration,
  };
}
