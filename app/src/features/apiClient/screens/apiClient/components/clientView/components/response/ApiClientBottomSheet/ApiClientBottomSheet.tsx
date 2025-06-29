import React, { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import ResponseHeaders from "../ResponseHeaders/ResponseHeaders";
import { getContentTypeFromResponseHeaders } from "features/apiClient/screens/apiClient/utils";
import ResponseBody from "../ResponseBody/ResponseBody";
import { BottomSheet } from "componentsV2/BottomSheet";
import StatusLine from "../StatusLine";
import { Tag } from "antd";
import { TestsView } from "../TestsView/TestsView";
import { TestResult, TestStatus } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";
import { ApiClientErrorPanel } from "../../errors/ApiClientErrorPanel/ApiClientErrorPanel";
import { ApiClientLoader } from "../LoadingPlaceholder/ApiClientLoader";
import { EmptyResponsePlaceholder } from "../EmptyResponsePlaceholder/EmptyResponsePlaceholder";
import { AbortError } from "../../errors/AbortError";
import { RequestError } from "../../errors/RequestError";
import { ApiClientWarningPanel } from "../../errors/ApiClientWarningPanel/ApiClientWarningPanel";
import "./apiclientBottomSheet.scss";

interface Props {
  response: RQAPI.Response;
  testResults: TestResult[];
  isLoading: boolean;
  isFailed: boolean;
  isRequestCancelled: boolean;
  onCancelRequest: () => void;
  handleTestResultRefresh: () => Promise<void>;
  executeRequest: () => Promise<void>;
  onDismissError: () => void;
  error?: RQAPI.ExecutionError;
  warning?: RQAPI.ExecutionWarning;
}

const BOTTOM_SHEET_TAB_KEYS = {
  RESPONSE: "RESPONSE",
  HEADERS: "HEADERS",
  TEST_RESULTS: "TEST_RESULTS",
};

export const ApiClientBottomSheet: React.FC<Props> = ({
  response,
  testResults,
  isLoading,
  isFailed,
  isRequestCancelled,
  handleTestResultRefresh,
  onCancelRequest,
  error,
  warning,
  executeRequest,
  onDismissError,
}) => {
  const contentTypeHeader = useMemo(() => {
    return response?.headers ? getContentTypeFromResponseHeaders(response.headers) : "";
  }, [response?.headers]);

  const testResultsStats = useMemo(() => {
    if (!testResults?.length) return null;

    const passedTestsCount = testResults.filter((testResult) => testResult.status === TestStatus.PASSED).length;

    return (
      <Tag className={`count test-results-stats ${passedTestsCount === testResults.length ? "passed" : "failed"}`}>
        ({passedTestsCount} / {testResults.length})
      </Tag>
    );
  }, [testResults]);

  const bottomSheetTabItems = useMemo(() => {
    const baseTabItems = [
      {
        key: BOTTOM_SHEET_TAB_KEYS.RESPONSE,
        label: "Body",
        children: <ResponseBody responseText={response?.body} contentTypeHeader={contentTypeHeader} />,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.HEADERS,
        label: (
          <>Headers {response?.headers?.length ? <Tag className="count">{response?.headers?.length}</Tag> : null}</>
        ),
        children: <ResponseHeaders headers={response?.headers} />,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.TEST_RESULTS,
        label: <>Tests {testResultsStats}</>,
        children: <TestsView testResults={testResults} handleTestResultRefresh={handleTestResultRefresh} />,
      },
    ];

    if (isLoading) {
      return baseTabItems.map((tabItem) => {
        return {
          ...tabItem,
          children: <ApiClientLoader onCancelRequest={onCancelRequest} />,
        };
      });
    }

    if (isRequestCancelled) {
      return baseTabItems.map((tabItem) => {
        return {
          ...tabItem,
          children: <AbortError error={error} onRetry={executeRequest} onDismiss={onDismissError} />,
        };
      });
    }

    if (!response) {
      if (isFailed) {
        return baseTabItems.map((tabItem) => {
          return {
            ...tabItem,
            children: <RequestError error={error} onRetry={executeRequest} />,
          };
        });
      }

      return baseTabItems.map((tabItem) => {
        return {
          ...tabItem,
          children: (
            <EmptyResponsePlaceholder
              isFailed={isFailed}
              emptyDescription="Please run a request to see the response"
              error={error}
            />
          ),
        };
      });
    }

    return baseTabItems;
  }, [
    contentTypeHeader,
    error,
    executeRequest,
    handleTestResultRefresh,
    isFailed,
    isLoading,
    isRequestCancelled,
    onCancelRequest,
    response,
    testResults,
    testResultsStats,
    onDismissError,
  ]);

  return (
    <div className="api-client-sheet-panel-container">
      {response && error?.type === RQAPI.ApiClientErrorType.SCRIPT && !isRequestCancelled && (
        <ApiClientErrorPanel error={error} />
      )}
      {!error && warning && !isRequestCancelled && <ApiClientWarningPanel warning={warning} />}
      <div className="api-client-sheet-panel">
        <BottomSheet
          items={bottomSheetTabItems}
          tabBarExtraContent={!isLoading && <StatusLine response={response} />}
        />
      </div>
    </div>
  );
};
