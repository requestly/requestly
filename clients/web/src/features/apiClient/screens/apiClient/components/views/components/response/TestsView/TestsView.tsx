import React, { useCallback, useMemo, useState } from "react";
import { EmptyTestsView } from "./components/EmptyTestsView/EmptyTestsView";
import { TestResultItem } from "./components/TestResult/TestResult";
import { Badge, Radio, Skeleton } from "antd";
import { MdRefresh } from "@react-icons/all-files/md/MdRefresh";
import { RQButton } from "lib/design-system-v2/components";
import { useTheme } from "styled-components";
import "./testsView.scss";
import { TestResult, TestStatus } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";
import { LOGGER as Logger } from "@requestly/utils";
import { LoadingOutlined } from "@ant-design/icons";

interface TestsViewProps {
  handleTestResultRefresh: () => Promise<void>;
  testResults: TestResult[];
  onGenerateTests?: () => void;
  isGeneratingTests?: boolean;
  canGenerateTests?: boolean;
}

type TestsFilter = TestResult["status"] | "all";

export const TestsView: React.FC<TestsViewProps> = ({
  testResults,
  handleTestResultRefresh,
  onGenerateTests,
  isGeneratingTests = false,
  canGenerateTests = false,
}) => {
  const theme = useTheme();
  const [testsFilter, setTestsFilter] = useState<TestsFilter>("all");
  const [isResultRefreshing, setIsResultRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsResultRefreshing(true);
    try {
      await handleTestResultRefresh();
    } catch (error) {
      Logger.error("Error while refreshing the result", error);
    } finally {
      setIsResultRefreshing(false);
    }
  }, [handleTestResultRefresh]);

  const testCounts = useMemo(() => {
    return {
      all: testResults?.length,
      passed: testResults?.filter((test) => test.status === TestStatus.PASSED).length,
      failed: testResults?.filter((test) => test.status === TestStatus.FAILED).length,
      skipped: testResults?.filter((test) => test.status === TestStatus.SKIPPED).length,
    };
  }, [testResults]);

  const filteredTestResults = useMemo(() => {
    if (testsFilter === "all") {
      return testResults;
    }
    return testResults?.filter((testResult) => testResult.status === testsFilter);
  }, [testResults, testsFilter]);

  if (!testResults?.length) {
    return (
      <EmptyTestsView
        onGenerateTests={onGenerateTests}
        isGeneratingTests={isGeneratingTests}
        canGenerateTests={canGenerateTests}
      />
    );
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
              All{" "}
              {testCounts.all ? <Badge size="small" count={testCounts.all} color={theme.colors["white-t-10"]} /> : null}
            </Radio.Button>
            <Radio.Button value="passed">
              Passed{" "}
              {testCounts.passed ? (
                <Badge size="small" count={testCounts.passed} color={theme.colors["white-t-10"]} />
              ) : null}
            </Radio.Button>
            <Radio.Button value="failed">
              Failed{" "}
              {testCounts.failed ? (
                <Badge size="small" count={testCounts.failed} color={theme.colors["white-t-10"]} />
              ) : null}
            </Radio.Button>
            <Radio.Button value="skipped">
              Skipped{" "}
              {testCounts.skipped ? (
                <Badge size="small" count={testCounts.skipped} color={theme.colors["white-t-10"]} />
              ) : null}
            </Radio.Button>
          </Radio.Group>
        </div>
        <RQButton
          className="tests-refresh-btn"
          size="small"
          type="transparent"
          disabled={isResultRefreshing}
          icon={isResultRefreshing ? <LoadingOutlined /> : <MdRefresh />}
          onClick={handleRefresh}
        >
          {isResultRefreshing ? "Refreshing..." : "Refresh"}
        </RQButton>
      </div>

      {isResultRefreshing ? (
        <div className="test-results-list">
          {filteredTestResults.map((testResult, index) => (
            <div key={index} className="test-result-item">
              <Skeleton.Button size="default" style={{ height: 16 }} />
              <Skeleton.Button shape="round" size="small" block={true} style={{ height: 16 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="test-results-list">
          {filteredTestResults.map((testResult, index) => (
            <TestResultItem key={index} testResult={testResult} />
          ))}
        </div>
      )}
    </div>
  );
};
