import React from "react";
import { upperCase } from "lodash";
import { TestResult, TestStatus } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";

interface TestResultProps {
  testResult: TestResult;
}

export const TestResultItem: React.FC<TestResultProps> = ({ testResult }) => {
  const label =
    testResult.status === TestStatus.PASSED
      ? "PASS"
      : testResult.status === TestStatus.FAILED
      ? "FAIL"
      : upperCase(testResult.status);

  return (
    <div className="test-result-item">
      <div className={`test-result-item-status-badge ${testResult.status}`}>{label}</div>
      <div className="test-result-item-message">
        {testResult.name}
        {testResult.status === TestStatus.FAILED ? ` | ${testResult.error}` : ""}
      </div>
    </div>
  );
};
