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
import { TestResult } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";
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
  const stopScrolling = useRef<boolean>(false);

  // useEffect(() => {
  //   const handleScroll = (e: Event) => {
  //     const container = e.target as HTMLElement;

  //     stopScrolling.current = true;
  //     // } else {
  //     //   keepScrolling.current = true;
  //     // }
  //   };

  //   document.addEventListener("scroll", handleScroll);
  //   document.addEventListener("wheel", handleScroll);
  //   document.addEventListener("touchstart", handleScroll);

  //   return () => {
  //     document.removeEventListener("scroll", handleScroll);
  //     document.removeEventListener("wheel", handleScroll);
  //     document.removeEventListener("touchstart", handleScroll);
  //   };
  // }, []);

  const handleAutoScroll = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return;
    }

    if (stopScrolling.current) {
      return;
    }

    // node?.scrollIntoView({
    //   behavior: "smooth",
    //   block: "end",
    // });
  }, []);

  return (
    <div ref={handleAutoScroll} className="test-details-container">
      <div className="request-details">
        {runningRequest.entry.type === RQAPI.ApiEntryType.HTTP ? (
          <>
            <HttpMethodIcon method={runningRequest.entry.method} />
            <span className="request-name">{runningRequest.recordName}</span> {"..."}
          </>
        ) : (
          <>
            <GraphQlIcon />
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
  testResults: TestResult[];
}> = ({ requestExecutionResult, testResults }) => {
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
          {requestExecutionResult.entry.type === RQAPI.ApiEntryType.HTTP ? (
            <HttpMethodIcon method={requestExecutionResult.entry.method} />
          ) : (
            <GraphQlIcon />
          )}
        </span>
        {requestNameDetails}
        {responseDetails}
      </div>

      {testResults.length === 0 ? (
        <div className="no-test-found-message">
          <i>No test found</i>
        </div>
      ) : (
        <div className="results-list">
          {testResults.map((test) => {
            return <TestResultItem testResult={test} />;
          })}
        </div>
      )}
    </div>
  );
};

const TestResultList: React.FC<{
  tabKey: RunResultTabKey;
  results: TestSummary;
}> = ({ tabKey, results }) => {
  const [currentlyExecutingRequest] = useRunResultStore((s) => [s.currentlyExecutingRequest]);

  const currentRunningRequest = currentlyExecutingRequest ? (
    <RunningRequestPlaceholder runningRequest={currentlyExecutingRequest} />
  ) : null;

  // TODO: use virtualize list
  const resultsToShow = useMemo(() => {
    return tabKey === RunResultTabKey.ALL
      ? Array.from(results)
      : Array.from(results).filter(([iteration, details]) => {
          return details.filter(({ testResults }) => testResults.length > 0).length > 0;
        });
  }, [results, tabKey]);

  if (resultsToShow.length === 0) {
    return (
      <EmptyState
        title={testResultListEmptyStateMessage[tabKey].title}
        description={testResultListEmptyStateMessage[tabKey].description}
      />
    );
  }

  if (results.size > 1) {
    return resultsToShow.map(([iteration, details]) => {
      return (
        <div key={iteration} className="test-result-collapse-container tests-results-view-container">
          <Collapse
            ghost
            className="test-result-collapse"
            defaultActiveKey={["1"]}
            expandIcon={({ isActive }) => {
              return <MdOutlineArrowForwardIos className={`collapse-expand-icon ${isActive ? "expanded" : ""}`} />;
            }}
          >
            <Collapse.Panel header={`ITERATION-${iteration}`} key="1">
              {details.map(({ requestExecutionResult, testResults }) => {
                return (
                  <TestDetails
                    key={requestExecutionResult.recordId}
                    requestExecutionResult={requestExecutionResult}
                    testResults={testResults}
                  />
                );
              })}
              {iteration === currentlyExecutingRequest?.iteration ? currentRunningRequest : null}
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
        return (
          <TestDetails
            key={requestExecutionResult.recordId}
            requestExecutionResult={requestExecutionResult}
            testResults={testResults}
          />
        );
      })}
      {currentRunningRequest}
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
      {result.result.size === 0 ? (
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
