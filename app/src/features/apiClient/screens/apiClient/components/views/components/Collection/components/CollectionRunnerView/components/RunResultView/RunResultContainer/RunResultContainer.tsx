import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { useRunConfigStore, useRunResultStore } from "../../../run.context";
import { LoadingOutlined } from "@ant-design/icons";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { RequestViewTabSource } from "../../../../../../RequestView/requestViewTabSource";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import "./runResultContainer.scss";
import { getFormattedStartTime, getFormattedTime } from "../utils";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { RQTooltip } from "lib/design-system-v2/components";
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from "react-virtualized";

enum RunResultTabKey {
  ALL = "all",
  SUCCESS = "success",
  FAIL = "fail",
  SKIPPED = "skipped",
}

const testResultListEmptyStateMessage: Record<RunResultTabKey, { title: string; description: string }> = {
  [RunResultTabKey.ALL]: {
    title: "No tests found",
    description: "No tests to show.",
  },
  [RunResultTabKey.FAIL]: {
    title: "No failed tests",
    description: "No tests failed in this run.",
  },
  [RunResultTabKey.SKIPPED]: {
    title: "No skipped tests",
    description: "No tests skipped in this run.",
  },
  [RunResultTabKey.SUCCESS]: {
    title: "No successful tests",
    description: "No tests passed in this run.",
  },
};

const RunningRequestPlaceholder: React.FC<{
  runningRequest: CurrentlyExecutingRequest;
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

// Memoized TestDetails component to prevent unnecessary re-renders
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
          <span className="response-status">
            · {requestExecutionResult.entry.statusCode} {requestExecutionResult.entry.statusText}
          </span>
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
        <span className="collection-name">{requestExecutionResult.collectionName} /</span>
        <span
          className="request-name"
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
          {requestExecutionResult.testResults?.map((test) => {
            return <TestResultItem testResult={test} key={test.name} />;
          })}
        </div>
      )}
    </div>
  );
});

// Virtualized TestResultList with dynamic row heights
const TestResultList: React.FC<{
  tabKey: RunResultTabKey;
  results: TestSummary;
}> = ({ tabKey, results }) => {
  const [iterations] = useRunConfigStore((s) => [s.iterations]);
  const [currentlyExecutingRequest] = useRunResultStore((s) => [s.currentlyExecutingRequest]);

  const COLLAPSED_HEIGHT = 28; // Fixed height for collapsed iteration header

  // All iterations are expanded by default
  const [expandedIterations, setExpandedIterations] = useState<Set<number>>(
    () => new Set(Array.from({ length: iterations }, (_, i) => i + 1))
  );

  // Track the measured expanded height (all expanded rows have same height)
  const expandedHeightRef = useRef<number | null>(null);

  // Cache for dynamic row heights
  const cacheRef = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 200,
      minHeight: COLLAPSED_HEIGHT,
    })
  );

  const listRef = useRef<List>(null);

  const currentRunningRequest = currentlyExecutingRequest ? (
    <RunningRequestPlaceholder runningRequest={currentlyExecutingRequest} />
  ) : null;

  // Convert results to array for virtualization
  const resultsToShow = useMemo(() => Array.from(results), [results]);

  const toggleIteration = useCallback(
    (iteration: number, index: number) => {
      const isExpanded = expandedIterations.has(iteration);

      setExpandedIterations((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(iteration)) {
          newSet.delete(iteration);
        } else {
          newSet.add(iteration);
        }
        return newSet;
      });

      if (isExpanded) {
        // Collapsing: immediately set to fixed collapsed height
        cacheRef.current.set(index, 0, COLLAPSED_HEIGHT, COLLAPSED_HEIGHT);
        listRef.current?.recomputeRowHeights(index);
      }
      // For expanding: do nothing here, let handleTransitionEnd handle it
    },
    [COLLAPSED_HEIGHT, expandedIterations]
  );

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

  // Virtualized list for multiple iterations
  const rowRenderer = ({ index, key, style, parent }: any) => {
    const [iteration, details] = resultsToShow[index];
    const isExpanded = expandedIterations.has(iteration);
    const isCurrentIteration = iteration === currentlyExecutingRequest?.iteration;

    return (
      <CellMeasurer cache={cacheRef.current} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        {({ registerChild, measure }: any) => {
          const handleTransitionEnd = (e: React.TransitionEvent) => {
            // After expansion animation completes, measure and cache the height
            if (e.propertyName === "height" && isExpanded) {
              // If we have a cached height, use it immediately
              if (expandedHeightRef.current !== null) {
                cacheRef.current.set(index, 0, expandedHeightRef.current, expandedHeightRef.current);
                listRef.current?.recomputeRowHeights(index);
              } else {
                // First time: measure and cache
                measure();
                const rowHeight = cacheRef.current.rowHeight({ index });
                expandedHeightRef.current = rowHeight;
              }
            }
          };

          return (
            <div
              ref={registerChild}
              style={style}
              className="test-result-collapse-container"
              onTransitionEnd={handleTransitionEnd}
            >
              <Collapse
                className="test-result-collapse"
                activeKey={isExpanded ? [iteration] : []}
                onChange={() => toggleIteration(iteration, index)}
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
        }}
      </CellMeasurer>
    );
  };

  return (
    <div className="tests-results-view-container virtualized-test-results-container">
      <AutoSizer>
        {({ height, width }) => {
          if (!height || !width) return null;

          return (
            <List
              ref={listRef}
              width={width}
              height={height}
              rowCount={resultsToShow.length}
              rowHeight={cacheRef.current.rowHeight}
              deferredMeasurementCache={cacheRef.current}
              rowRenderer={rowRenderer}
              overscanRowCount={2}
              scrollToIndex={currentlyExecutingRequest ? currentlyExecutingRequest.iteration - 1 : undefined}
              scrollToAlignment="end"
            />
          );
        }}
      </AutoSizer>
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
        children: <TestResultList tabKey={RunResultTabKey.ALL} results={summary.totalTests} />,
      },
      {
        key: RunResultTabKey.SUCCESS,
        label: <TestResultTabTitle title="Success" count={summary.successTestsCounts} loading={running} />,
        children: <TestResultList tabKey={RunResultTabKey.SUCCESS} results={summary.successTests} />,
      },
      {
        key: RunResultTabKey.FAIL,
        label: <TestResultTabTitle title="Fail" count={summary.failedTestsCounts} loading={running} />,
        children: <TestResultList tabKey={RunResultTabKey.FAIL} results={summary.failedTests} />,
      },
      {
        key: RunResultTabKey.SKIPPED,
        label: <TestResultTabTitle title="Skipped" count={summary.skippedTestsCounts} loading={running} />,
        children: <TestResultList tabKey={RunResultTabKey.SKIPPED} results={summary.skippedTests} />,
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
              destroyInactiveTabPane={false}
              onChange={(activeKey) => setActiveTab(activeKey as RunResultTabKey)}
              className="test-result-tabs"
            />
          </div>
        </>
      )}
    </div>
  );
};
