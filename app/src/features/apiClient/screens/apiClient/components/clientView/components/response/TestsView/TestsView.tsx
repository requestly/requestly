import React, { useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { EmptyTestsView } from "./components/EmptyTestsView/EmptyTestsView";
import { TestResult } from "./components/TestResult/TestResult";
import { Badge, Radio, Spin } from "antd";
import { MdRefresh } from "@react-icons/all-files/md/MdRefresh";
import { RQButton } from "lib/design-system-v2/components";
import { useTheme } from "styled-components";
import "./testsView.scss";

interface TestsViewProps {
  isLoading: boolean;
  onCancelRequest: () => void;
  testResults: RQAPI.TestResult[];
}

type TestsFilter = RQAPI.TestResult["status"] | "all";

export const TestsView: React.FC<TestsViewProps> = ({ isLoading, onCancelRequest, testResults }) => {
  const theme = useTheme();
  const [testsFilter, setTestsFilter] = useState<TestsFilter>("all");

  const testCounts = useMemo(() => {
    return {
      all: testResults?.length,
      passed: testResults?.filter((test) => test.status === "passed").length,
      failed: testResults?.filter((test) => test.status === "failed").length,
      skipped: testResults?.filter((test) => test.status === "skipped").length,
    };
  }, [testResults]);

  const filteredTestResults = useMemo(() => {
    if (testsFilter === "all") {
      return testResults;
    }
    return testResults?.filter((testResult) => testResult.status === testsFilter);
  }, [testResults, testsFilter]);

  if (isLoading) {
    return (
      <div className="api-client-response__loading-overlay">
        <Spin size="large" tip="Request in progress..." />
        <RQButton onClick={onCancelRequest} className="mt-16">
          Cancel request
        </RQButton>
      </div>
    );
  }

  if (!testResults?.length) {
    return <EmptyTestsView />;
  }

  return (
    <div className="tests-results-view-container">
      <div className="tests-results-view-header">
        <div className="tests-results-filters">
          <Radio.Group
            className="tests-results-filters-radio-group"
            onChange={(e) => setTestsFilter(e.target.value)}
            defaultValue="all"
            value={testsFilter}
            size="small"
          >
            <Radio.Button value="all">
              All <Badge size="small" count={testCounts.all} color={theme.colors["white-t-10"]} />
            </Radio.Button>
            <Radio.Button value="passed">
              Passed <Badge size="small" count={testCounts.passed} color={theme.colors["white-t-10"]} />
            </Radio.Button>
            <Radio.Button value="failed">
              Failed <Badge size="small" count={testCounts.failed} color={theme.colors["white-t-10"]} />
            </Radio.Button>
            <Radio.Button value="skipped">
              Skipped <Badge size="small" count={testCounts.skipped} color={theme.colors["white-t-10"]} />
            </Radio.Button>
          </Radio.Group>
        </div>
        <RQButton className="tests-refresh-btn" size="small" type="transparent" icon={<MdRefresh />}>
          Refresh
        </RQButton>
      </div>

      <div className="test-results-list">
        {filteredTestResults.map((testResult) => (
          <TestResult testResult={testResult} />
        ))}
      </div>
    </div>
  );
};
