import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Collapse, Spin, Tabs, Typography } from "antd";
import {
  CurrentlyExecutingRequest,
  LiveRunResult,
  RequestExecutionResult,
  RunResult,
} from "features/apiClient/slices/common/runResults/types";
import { getAllTestSummary, getRunMetrics, TestSummary } from "features/apiClient/store/collectionRunResult/utils";
import { TestResultItem } from "../../../../../../response/TestsView/components/TestResult/TestResult";
import { RQAPI } from "features/apiClient/types";
import {
  GraphQlIcon,
  HttpMethodIcon,
} from "features/apiClient/screens/apiClient/components/sidebar/components/collectionsList/requestRow/RequestRow";
import { EmptyState } from "../../EmptyState/EmptyState";
import { LoadingOutlined } from "@ant-design/icons";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import "./runResultContainer.scss";
import { getFormattedStartTime, getFormattedTime } from "../utils";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { useCollectionView } from "../../../../../collectionView.context";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { selectLiveRunResultCurrentlyExecutingRequest } from "features/apiClient/slices/liveRunResults/selectors";
import { RunResultDetailedView } from "../RunResultDetailedView/RunResultDetailedView";
import { RequestDetailsHeader } from "./RequestDetailsHeader";
import Split from "react-split";
import { getEventByExecutionId } from "store/slices/eventsStream/selectors";
import { useSelector } from "react-redux/es/hooks/useSelector";

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
  onDetailsClick: (result: RequestExecutionResult) => void;
  selectedRequestExId?: string;
}> = React.memo(({ requestExecutionResult, onDetailsClick, selectedRequestExId }) => {
  const workspaceId = useWorkspaceId();

  const events = useSelector((state) =>
    requestExecutionResult?.executionId ? getEventByExecutionId(requestExecutionResult.executionId)(state as any) : []
  );
  const requestEvent = useMemo(() => events.find((e) => e.data.type === "REQUEST"), [events]);

  const requestUrl = useMemo(() => {
    if (!requestEvent) return null;
    const request = requestEvent.data.payload as RQAPI.Request;
    if (request.url) {
      return request.url;
    }
    return null;
  }, [requestEvent]);

  const isSelected = selectedRequestExId === requestExecutionResult?.executionId;
  return (
    <div
      className={`test-details-container ${isSelected ? "selected" : ""}`}
      onClick={() => onDetailsClick(requestExecutionResult)}
    >
      <RequestDetailsHeader
        requestExecutionResult={requestExecutionResult}
        workspaceId={workspaceId || null}
        clickable={true}
        showFullPath={true}
      />
      {requestUrl && (
        <div className="request-url">
          <span className="url-text" title={requestUrl}>
            {requestUrl}
          </span>
        </div>
      )}

      {requestExecutionResult.status?.value === RQAPI.ExecutionStatus["ERROR"] ? (
        <div className="execution-error-message">
          <MdOutlineWarningAmber />
          <Typography.Paragraph
            className="message"
            ellipsis={{
              tooltip: {
                title: requestExecutionResult.status.error.message || "Something went wrong!",
                overlayClassName: "rq-tooltip",
              },
            }}
          >
            {requestExecutionResult.status.error.message || "Something went wrong!"}
          </Typography.Paragraph>
        </div>
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
  onDetailsClick: (result: RequestExecutionResult) => void;
  selectedRequestExId?: string;
}> = ({ tabKey, results, totalIterationCount, onDetailsClick, selectedRequestExId }) => {
  const { collectionId } = useCollectionView();
  const currentlyExecutingRequest = useApiClientSelector((state) =>
    selectLiveRunResultCurrentlyExecutingRequest(state, collectionId)
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const resultsToShow = useMemo(() => Array.from(results), [results]);

  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(() => {
    const iterationCount = totalIterationCount || resultsToShow.length;
    return new Set(Array.from({ length: iterationCount }, (_, idx) => idx + 1));
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
  if (results.size === 1 && resultsToShow[0]) {
    return (
      <div className="tests-results-view-container">
        {resultsToShow[0][1].map(({ requestExecutionResult }) => {
          return (
            <TestDetails
              key={requestExecutionResult.recordId}
              requestExecutionResult={requestExecutionResult}
              onDetailsClick={onDetailsClick}
              selectedRequestExId={selectedRequestExId}
            />
          );
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
          const result = resultsToShow[virtualItem.index];
          if (!result) return null;

          const [iteration, details] = result;
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
                      onDetailsClick={onDetailsClick}
                      selectedRequestExId={selectedRequestExId}
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
      <span className={`title ${title?.toLowerCase()}`}>{title}</span>{" "}
      <Badge size="small" count={loading ? "..." : count} className={`${title?.toLowerCase()}`} />
    </div>
  );
};

export const EmptyRunResultContainer: React.FC = () => {
  return (
    <div className="run-result-view-details">
      <EmptyState
        title="No test result found"
        description="Please add test cases in scripts tab and run them to see results."
      />
    </div>
  );
};

export const RunResultContainer: React.FC<{
  ranAt: number;
  result: LiveRunResult | RunResult;
  running?: boolean;
  totalIterationCount?: number;
  isDetailedViewOpen?: boolean;
  onToggleDetailedView?: (open: boolean) => void;
}> = ({ ranAt, result, running = false, totalIterationCount, isDetailedViewOpen, onToggleDetailedView }) => {
  const [activeTab, setActiveTab] = useState<RunResultTabKey>(RunResultTabKey.ALL);
  const [selectedRequest, setSelectedRequest] = useState<RequestExecutionResult | null>(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const workspaceId = useWorkspaceId() || null;

  // Derive showDetailedView from selectedRequest and isDetailedViewOpen
  const showDetailedView = selectedRequest !== null && isDetailedViewOpen !== false;

  // Sync local state when parent's isDetailedViewOpen changes
  useEffect(() => {
    if (isDetailedViewOpen === false) {
      setSelectedRequest(null);
      setUserHasInteracted(false);
      setActiveTab(RunResultTabKey.ALL);
    }
  }, [isDetailedViewOpen]);

  const metrics = useMemo(() => {
    return getRunMetrics(result.iterations);
  }, [result.iterations]);

  const summary = useMemo(() => {
    return getAllTestSummary(result.iterations);
  }, [result.iterations]);

  // Get the current tab's results
  const getCurrentTabResults = (tab: RunResultTabKey) => {
    switch (tab) {
      case RunResultTabKey.ALL:
        return summary.totalTests;
      case RunResultTabKey.PASSED:
        return summary.successTests;
      case RunResultTabKey.FAILED:
        return summary.failedTests;
      case RunResultTabKey.SKIPPED:
        return summary.skippedTests;
      default:
        return new Map();
    }
  };

  // Auto-select first result when tab changes (only if user has previously interacted)
  const handleTabChange = (newTab: RunResultTabKey) => {
    setActiveTab(newTab);

    if (!userHasInteracted) return;

    const tabResults = getCurrentTabResults(newTab);

    if (tabResults.size === 0) {
      setSelectedRequest(null);
    } else {
      // Select first result from the first iteration
      const firstIterationResults = Array.from(tabResults.values())[0];
      if (firstIterationResults && firstIterationResults.length > 0) {
        const firstResult = firstIterationResults[0]?.requestExecutionResult;
        if (firstResult) {
          setSelectedRequest(firstResult);
          onToggleDetailedView?.(true);
        }
      }
    }
  };

  // Calculate split sizes based on whether a request is selected
  const splitSizes = useMemo(() => {
    return showDetailedView && selectedRequest ? [50, 50] : [100, 0];
  }, [showDetailedView, selectedRequest]);

  const minSplitSizes = useMemo(() => {
    return showDetailedView && selectedRequest ? [500, 500] : [500, 0];
  }, [showDetailedView, selectedRequest]);

  const handleDetailsClick = useCallback(
    (requestResult: RequestExecutionResult) => {
      setSelectedRequest(requestResult);
      setUserHasInteracted(true);
      onToggleDetailedView?.(true);
    },
    [onToggleDetailedView]
  );

  const handlePanelClose = () => {
    setSelectedRequest(null);
    setUserHasInteracted(false);
    onToggleDetailedView?.(false);
  };

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

  const headerBreadcrumb = useMemo(() => {
    if (!selectedRequest) return null;

    return (
      <RequestDetailsHeader
        requestExecutionResult={selectedRequest}
        workspaceId={workspaceId}
        clickable={false}
        showFullPath={false}
        showNetworkDetails={false}
        breadCrumbSeperator="/"
      />
    );
  }, [selectedRequest, workspaceId]);

  const MetricsHeader = () => (
    <div className="result-header">
      {runMetrics.map((data, index) => (
        <div key={index} className="run-metric">
          <span className="label">{data.label}:</span>
          <span className="value">{data.value}</span>
        </div>
      ))}
    </div>
  );

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
            onDetailsClick={handleDetailsClick}
            selectedRequestExId={selectedRequest?.executionId}
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
            onDetailsClick={handleDetailsClick}
            selectedRequestExId={selectedRequest?.executionId}
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
            onDetailsClick={handleDetailsClick}
            selectedRequestExId={selectedRequest?.executionId}
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
            onDetailsClick={handleDetailsClick}
            selectedRequestExId={selectedRequest?.executionId}
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
    handleDetailsClick,
    selectedRequest,
  ]);

  return (
    <div className="run-result-view-details-wrapper">
      <Split
        direction="horizontal"
        sizes={splitSizes}
        minSize={minSplitSizes}
        gutterSize={selectedRequest ? 4 : 0}
        className="run-result-split-container"
      >
        <div className="run-result-view-details">
          {!showDetailedView && <MetricsHeader />}
          <div className="result-tabs-container">
            <Tabs
              moreIcon={null}
              items={tabItems}
              animated={false}
              activeKey={activeTab}
              destroyInactiveTabPane={true}
              onChange={(activeKey) => handleTabChange(activeKey as RunResultTabKey)}
              className="test-result-tabs"
            />
          </div>
        </div>
        <div className="run-result-detail-panel-container">
          {showDetailedView && (
            <>
              <div className="run-result-view-details right-panel-opened">
                <MetricsHeader />
              </div>
              <div className="run-result-details">
                {showDetailedView && selectedRequest && (
                  <RunResultDetailedView
                    onClose={handlePanelClose}
                    executionId={selectedRequest.executionId}
                    headerBreadcrumb={headerBreadcrumb}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </Split>
    </div>
  );
};
