import React, { useMemo, useState } from "react";
import { Badge, Collapse, Tabs } from "antd";
import {
  LiveRunResult,
  RequestExecutionResult,
  RunResult,
} from "features/apiClient/store/collectionRunResult/runResult.store";
import { getAllTestSummary, getRunMetrics, TestSummary } from "features/apiClient/store/collectionRunResult/utils";
import { TestResultItem } from "../../../../../../response/TestsView/components/TestResult/TestResult";
import moment from "moment";
import { TestResult } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";
import { RQAPI } from "features/apiClient/types";
import {
  GraphQlIcon,
  HttpMethodIcon,
} from "features/apiClient/screens/apiClient/components/sidebar/components/collectionsList/requestRow/RequestRow";
import "./runResultContainer.scss";

enum RunResultTabKey {
  ALL = "all",
  SUCCESS = "success",
  FAIL = "fail",
  SKIPPED = "skipped",
}

const TestDetails: React.FC<{
  requestExecutionResult: RequestExecutionResult;
  testResults: TestResult[];
}> = ({ requestExecutionResult, testResults }) => {
  if (testResults.length === 0) {
    return null;
  }

  const responseDetails = (
    <div className="response-details">
      <span className="response-time">{Math.round(requestExecutionResult.entry.responseTime)}ms</span>·
      <span className="response-status">
        {requestExecutionResult.entry.statusCode} {requestExecutionResult.entry.statusText}
      </span>
    </div>
  );

  return (
    <div className="test-details-container">
      <div className="request-details">
        {requestExecutionResult.entry.type === RQAPI.ApiEntryType.HTTP ? (
          <>
            <HttpMethodIcon method={requestExecutionResult.entry.method} />
            <span className="request-name">{requestExecutionResult.recordName}</span>
            {responseDetails}
          </>
        ) : (
          <>
            <GraphQlIcon /> {requestExecutionResult.entry.type}
            <span className="request-name">{requestExecutionResult.recordName}</span>
            {responseDetails}
          </>
        )}
      </div>
      <div className="results-list">
        {testResults.map((test) => {
          return <TestResultItem testResult={test} />;
        })}
      </div>
    </div>
  );
};

const TestResultList: React.FC<{ results: TestSummary }> = ({ results }) => {
  const resultsToShow = useMemo(() => {
    return Array.from(results).filter(([iteration, details]) => {
      return details.filter(({ testResults }) => testResults.length > 0);
    });
  }, [results]);

  // TODO: use virtualize list

  if (results.size > 1) {
    return resultsToShow.map(([iteration, details]) => {
      return (
        <div className="tests-results-view-container">
          <Collapse defaultActiveKey={["1"]} ghost>
            <Collapse.Panel header={`ITERATION-${iteration}`} key="1">
              {details.map(({ requestExecutionResult, testResults }) => {
                return <TestDetails requestExecutionResult={requestExecutionResult} testResults={testResults} />;
              })}
            </Collapse.Panel>
          </Collapse>
        </div>
      );
    });
  }

  // show first iteration without collapse
  return (
    <div className="tests-results-view-container">
      {resultsToShow[0][1].map(({ requestExecutionResult, testResults }) => {
        return <TestDetails requestExecutionResult={requestExecutionResult} testResults={testResults} />;
      })}
    </div>
  );
};

const TestResultTabTitle: React.FC<{ title: string; count: number; loading?: boolean }> = ({
  title,
  count,
  loading,
}) => {
  return (
    <div className="test-result-tab-title">
      <span className="title">{title}</span> <Badge size="small" count={loading ? "..." : count} />
    </div>
  );
};

export const RunResultContainer: React.FC<{
  ranAt: number;
  result: LiveRunResult | RunResult;
  running?: boolean;
}> = ({ ranAt, result, running = false }) => {
  const [activeTab, setActiveTab] = useState<RunResultTabKey>(RunResultTabKey.ALL);

  const metrics = useMemo(() => {
    return getRunMetrics(result.result);
  }, [result.result]);

  const summary = useMemo(() => {
    return getAllTestSummary(result.result);
  }, [result.result]);

  const runMetrics = useMemo(() => {
    const { totalDuration, avgResponseTime } = metrics;

    return [
      {
        label: "Ran at",
        value: ranAt ? moment(ranAt).format("MMM DD, YYYY [at] HH:mm:ss") : "...",
      },
      {
        label: "Duration",
        value: totalDuration ? `${totalDuration}ms` : "...",
      },
      {
        label: "Avg. resp. time",
        value: avgResponseTime ? `${avgResponseTime}ms` : "...",
      },
    ];
  }, [metrics, ranAt]);

  const tabItems = useMemo(() => {
    return [
      {
        key: RunResultTabKey.ALL,
        label: <TestResultTabTitle title="All" count={summary.totalTestsCounts} loading={running} />,
        children: <TestResultList key={RunResultTabKey.ALL} results={summary.totalTests} />,
      },
      {
        key: RunResultTabKey.SUCCESS,
        label: <TestResultTabTitle title="Success" count={summary.successTestsCounts} loading={running} />,
        children: <TestResultList key={RunResultTabKey.SUCCESS} results={summary.successTests} />,
      },
      {
        key: RunResultTabKey.FAIL,
        label: <TestResultTabTitle title="Fail" count={summary.failedTestsCounts} loading={running} />,
        children: <TestResultList key={RunResultTabKey.FAIL} results={summary.failedTests} />,
      },
      {
        key: RunResultTabKey.SKIPPED,
        label: <TestResultTabTitle title="Skipped" count={summary.skippedTestsCounts} loading={running} />,
        children: <TestResultList key={RunResultTabKey.SKIPPED} results={summary.skippedTests} />,
      },
    ];
  }, [
    running,
    summary.totalTestsCounts,
    summary.totalTests,
    summary.successTestsCounts,
    summary.successTests,
    summary.failedTestsCounts,
    summary.failedTests,
    summary.skippedTestsCounts,
    summary.skippedTests,
  ]);

  return (
    <div className="run-result-view-details">
      <div className="result-header">
        {runMetrics.map((data) => {
          return (
            <div className="run-metric">
              <span className="label">{data.label}:</span>
              <span className="value">{data.value}</span>
            </div>
          );
        })}
      </div>
      <div className="result-tabs-container">
        {result.result.size === 0 ? (
          <i>Nothing to show</i>
        ) : (
          <Tabs
            moreIcon={null}
            items={tabItems}
            animated={false}
            activeKey={activeTab}
            destroyInactiveTabPane={false}
            onChange={(activeKey) => setActiveTab(activeKey as RunResultTabKey)}
            className="test-result-tabs"
          />
        )}
      </div>
    </div>
  );
};
