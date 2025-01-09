import React from "react";
import { RQAPI } from "features/apiClient/types";
import { upperCase } from "lodash";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { FaRegCircle } from "@react-icons/all-files/fa/FaRegCircle";

interface TestResultProps {
  testResult: RQAPI.TestResult;
}

export const TestResult: React.FC<TestResultProps> = ({ testResult }) => {
  return (
    <div className="test-result-item">
      <div className={`test-result-item-status-badge ${testResult.status}`}>
        {testResult.status === "passed" ? (
          <MdCheckCircleOutline />
        ) : testResult.status === "failed" ? (
          <MdInfoOutline />
        ) : (
          <FaRegCircle />
        )}
        {upperCase(testResult.status)}
      </div>
      <div className="test-result-item-message">{testResult.message}</div>
    </div>
  );
};
