import React from "react";
import { upperCase } from "lodash";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { FaRegCircle } from "@react-icons/all-files/fa/FaRegCircle";
import { TestResult, TestStatus } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";

interface TestResultProps {
  testResult: TestResult;
}

export const TestResultItem: React.FC<TestResultProps> = ({ testResult }) => {
  return (
    <div className="test-result-item">
      <div className={`test-result-item-status-badge ${testResult.status}`}>
        {testResult.status === TestStatus.PASSED ? (
          <MdCheckCircleOutline />
        ) : testResult.status === TestStatus.FAILED ? (
          <MdInfoOutline />
        ) : (
          <FaRegCircle />
        )}
        {upperCase(testResult.status)}
      </div>
      <div className="test-result-item-message">
        {testResult.name}
        {testResult.status === TestStatus.FAILED ? ` | ${testResult.error}` : ""}
      </div>
    </div>
  );
};
