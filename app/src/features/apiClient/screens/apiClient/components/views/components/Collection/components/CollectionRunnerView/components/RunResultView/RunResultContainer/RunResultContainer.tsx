import React, { useMemo, useRef, useState } from "react";
import { Badge, Collapse, Spin, Tabs } from "antd";
import {
  CurrentlyExecutingRequest,
  LiveRunResult,
  RequestExecutionResult,
  RunResult,
} from "features/apiClient/store/collectionRunResult/runResult.store";
import { getAllTestSummary, getRunMetrics, TestSummary } from "features/apiClient/store/collectionRunResult/utils";
import { TestResultItem } from "../../../../../../response/TestsView/components/TestResult/TestResult";
import { RQAPI } from "features/apiClient/types";
import {
  GraphQlIcon,
  HttpMethodIcon,
} from "features/apiClient/screens/apiClient/components/sidebar/components/collectionsList/requestRow/RequestRow";
import { EmptyState } from "../../EmptyState/EmptyState";
import { useRunResultStore } from "../../../run.context";
import { LoadingOutlined } from "@ant-design/icons";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { RequestViewTabSource } from "../../../../../../RequestView/requestViewTabSource";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import "./runResultContainer.scss";
import { getFormattedStartTime, getFormattedTime } from "../utils";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { RQTooltip } from "lib/design-system-v2/components";
import { useVirtualizer } from "@tanstack/react-virtual";
import NetworkStatusField from "components/misc/NetworkStatusField";

enum RunResultTabKey {
  ALL = "all",
  PASSED = "passed",
  FAILED = "failed",
  SKIPPED = "skipped",
}

const testResultListEmptyStateMessage: Record<RunResultTabKey, { title: string; description: string }> = {
  [RunResultTabKey.ALL]: {
    title: "No tests found",
    description: "No tests to show.",
  },
  [RunResultTabKey.FAILED]: {
    title: "No failed tests",
    description: "No tests failed in this run.",
  },
  [RunResultTabKey.SKIPPED]: {
    title: "No skipped tests",
    description: "No tests skipped in this run.",
  },
  [RunResultTabKey.PASSED]: {
    title: "No successful tests",
    description: "No tests passed in this run.",
  },
};

const RunningRequestPlaceholder: React.FC<{
  runningRequest: Exclude<CurrentlyExecutingRequest, null>;
}> = ({ runningRequest }) => {
  return (
    <div className="test-details-container">
      <div className="request-details">
        {runningRequest.entry.type === RQAPI.ApiEntryType.GRAPHQL ? (
          <>
            <GraphQlIcon />
            <span className="request-name">{runningRequest.recordName}</span> {"..."}
          </>
        ) : (
          <>
            <HttpMethodIcon method={runningRequest.entry.method} />
            <span className="request-name">{runningRequest.recordName}</span> {"..."}
          </>
        )}
      </div>
      <div className="loader">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 16, color: "var(--requestly-color-text-placeholder)" }} spin />
          }
        />
        <span className="running-message">Request is running</span>
      </div>
    </div>
  );
};

const TestDetails: React.FC<{
  requestExecutionResult: RequestExecutionResult;
}> = React.memo(({ requestExecutionResult }) => {
  const context = useApiClientFeatureContext();
  const [openTab] = useTabServiceWithSelector((s) => [s.openTab]);

  const responseDetails = useMemo(() => {
    return (
      <div className="response-details">
        <span className="response-time">{Math.round(requestExecutionResult.entry.responseTime)}ms</span>
        {requestExecutionResult.entry.statusCode ? (
          <NetworkStatusField
            status={requestExecutionResult.entry.statusCode}
            statusText={requestExecutionResult.entry.statusText}
          />
        ) : null}
      </div>
    );
  }, [
    requestExecutionResult.entry.responseTime,
    requestExecutionResult.entry.statusCode,
    requestExecutionResult.entry.statusText,
  ]);

  const requestNameDetails = useMemo(() => {
    return (
      <>
        <span className="collection-name" title={requestExecutionResult.collectionName}>
          {requestExecutionResult.collectionName} /
        </span>
        <span
          className="request-name"
          title={requestExecutionResult.recordName}
          onClick={() => {
            openTab(
              new RequestViewTabSource({
                id: requestExecutionResult.recordId,
                title: requestExecutionResult.recordName,
                context: {
                  id: context.id,
                },
              })
            );
          }}
        >
          {requestExecutionResult.recordName}
        </span>
      </>
    );
  }, [
    context.id,
    openTab,
    requestExecutionResult.collectionName,
    requestExecutionResult.recordId,
    requestExecutionResult.recordName,
  ]);

  return (
    <div className="test-details-container">
      <div className="request-details">
        <span className="icon">
          {requestExecutionResult.entry.type === RQAPI.ApiEntryType.GRAPHQL ? (
            <GraphQlIcon />
          ) : (
            <HttpMethodIcon method={requestExecutionResult.entry.method} />
          )}
        </span>
        {requestNameDetails}
        {responseDetails}
      </div>

      {requestExecutionResult.status?.value === RQAPI.ExecutionStatus["ERROR"] ? (
        <RQTooltip title={requestExecutionResult.status.error.message || "Something went wrong!"}>
          <div className="execution-error-message">
            <MdOutlineWarningAmber />
            <span className="message">{requestExecutionResult.status.error.message || "Something went wrong!"}</span>
          </div>
        </RQTooltip>
      ) : requestExecutionResult?.testResults?.length === 0 ? (
        <div className="no-test-found-message">
          <i>No test found</i>
        </div>
      ) : (
        <div className="results-list">
          {requestExecutionResult.testResults?.map((test, index) => {
            return <TestResultItem key={index} testResult={test} />;
          })}
        </div>
      )}
    </div>
  );
});

const TestResultList: React.FC<{
  tabKey: RunResultTabKey;
  results: TestSummary;
  totalIterationCount?: number;
}> = ({ tabKey, results, totalIterationCount }) => {
  const [currentlyExecutingRequest] = useRunResultStore((s) => [s.currentlyExecutingRequest]);
  const parentRef = useRef<HTMLDivElement>(null);
  const resultsToShow = useMemo(() => Array.from(results), [results]);

  // Initialize with all iterations expanded by default
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(() => {
    if (!totalIterationCount) {
      return new Set(resultsToShow.map(([iteration]) => iteration));
    } else {
      // fill the set with iteration numbers from 1 to totalIterationCount
      return new Set(new Array(totalIterationCount).fill(0).map((_, idx) => idx + 1));
    }
  });

  const currentRunningRequest = currentlyExecutingRequest ? (
    <RunningRequestPlaceholder runningRequest={currentlyExecutingRequest} />
  ) : null;

  const rowVirtualizer = useVirtualizer({
    count: resultsToShow.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated size for collapsed/expanded items
    overscan: 3,
  });

  const handleCollapseChange = (iteration: number) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (prev.has(iteration)) {
        next.delete(iteration);
      } else {
        next.add(iteration);
      }
      return next;
    });
  };

  if (resultsToShow.length === 0) {
    return (
      <EmptyState
        title={testResultListEmptyStateMessage[tabKey].title}
        description={testResultListEmptyStateMessage[tabKey].description}
      />
    );
  }

  // For single iteration, render without virtualization
  if (results.size === 1) {
    return (
      <div className="tests-results-view-container">
        {resultsToShow[0][1].map(({ requestExecutionResult }) => {
          return <TestDetails key={requestExecutionResult.recordId} requestExecutionResult={requestExecutionResult} />;
        })}
        {currentRunningRequest}
      </div>
    );
  }

  const items = rowVirtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="tests-results-view-container">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
          minHeight: "100%",
        }}
      >
        {items.map((virtualItem) => {
          const [iteration, details] = resultsToShow[virtualItem.index];
          const isCurrentIteration = iteration === currentlyExecutingRequest?.iteration;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                transform: `translateY(${virtualItem.start}px)`,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
              }}
              className="test-result-collapse-container"
            >
              <Collapse
                ghost
                className="test-result-collapse"
                activeKey={expandedKeys.has(iteration) ? [iteration] : []}
                onChange={() => handleCollapseChange(iteration)}
                expandIcon={({ isActive }) => (
                  <MdOutlineArrowForwardIos className={`collapse-expand-icon ${isActive ? "expanded" : ""}`} />
                )}
              >
                <Collapse.Panel header={`ITERATION-${iteration}`} key={iteration}>
                  {details.map(({ requestExecutionResult }) => (
                    <TestDetails
                      key={requestExecutionResult.recordId}
                      requestExecutionResult={requestExecutionResult}
                    />
                  ))}
                  {isCurrentIteration ? currentRunningRequest : null}
                </Collapse.Panel>
              </Collapse>
            </div>
          );
        })}
      </div>
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
  totalIterationCount?: number;
}> = ({ ranAt, result, running = false, totalIterationCount }) => {
  const [activeTab, setActiveTab] = useState<RunResultTabKey>(RunResultTabKey.ALL);

  const metrics = useMemo(() => {
    return getRunMetrics(result.iterations);
  }, [result.iterations]);

  const summary = useMemo(() => {
    return getAllTestSummary(result.iterations);
  }, [result.iterations]);

  const runMetrics = useMemo(() => {
    const { totalDuration, avgResponseTime } = metrics;

    return [
      {
        label: "Ran at",
        value: ranAt ? getFormattedStartTime(ranAt) : "...",
      },
      {
        label: "Duration",
        value: totalDuration ? getFormattedTime(totalDuration) : "...",
      },
      {
        label: "Avg. resp. time",
        value: avgResponseTime ? getFormattedTime(avgResponseTime) : "...",
      },
    ];
  }, [metrics, ranAt]);

  const tabItems = useMemo(() => {
    return [
      {
        key: RunResultTabKey.ALL,
        label: <TestResultTabTitle title="All" count={summary.totalTestsCounts} loading={running} />,
        children: (
          <TestResultList
            tabKey={RunResultTabKey.ALL}
            results={summary.totalTests}
            totalIterationCount={totalIterationCount}
          />
        ),
      },
      {
        key: RunResultTabKey.PASSED,
        label: <TestResultTabTitle title="Passed" count={summary.successTestsCounts} loading={running} />,
        children: (
          <TestResultList
            tabKey={RunResultTabKey.PASSED}
            results={summary.successTests}
            totalIterationCount={totalIterationCount}
          />
        ),
      },
      {
        key: RunResultTabKey.FAILED,
        label: <TestResultTabTitle title="Failed" count={summary.failedTestsCounts} loading={running} />,
        children: (
          <TestResultList
            tabKey={RunResultTabKey.FAILED}
            results={summary.failedTests}
            totalIterationCount={totalIterationCount}
          />
        ),
      },
      {
        key: RunResultTabKey.SKIPPED,
        label: <TestResultTabTitle title="Skipped" count={summary.skippedTestsCounts} loading={running} />,
        children: (
          <TestResultList
            tabKey={RunResultTabKey.SKIPPED}
            results={summary.skippedTests}
            totalIterationCount={totalIterationCount}
          />
        ),
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
    totalIterationCount,
  ]);

  return (
    <div className="run-result-view-details">
      {result.iterations.size === 0 ? (
        <EmptyState
          title="No test result found"
          description="Please add test cases in scripts tab and run them to see results."
        />
      ) : (
        <>
          <div className="result-header">
            {runMetrics.map((data, index) => {
              return (
                <div key={index} className="run-metric">
                  <span className="label">{data.label}:</span>
                  <span className="value">{data.value}</span>
                </div>
              );
            })}
          </div>
          <div className="result-tabs-container">
            <Tabs
              moreIcon={null}
              items={tabItems}
              animated={false}
              activeKey={activeTab}
              destroyInactiveTabPane={true}
              onChange={(activeKey) => setActiveTab(activeKey as RunResultTabKey)}
              className="test-result-tabs"
            />
          </div>
        </>
      )}
    </div>
  );
};
