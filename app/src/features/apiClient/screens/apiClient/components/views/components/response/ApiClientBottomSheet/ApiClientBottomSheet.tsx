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
import { ApiClientLargeFileLoader } from "../../../../clientView/components/response/LargeFileLoadingPlaceholder";
import { MdDataObject } from "@react-icons/all-files/md/MdDataObject";
import { PiTag } from "@react-icons/all-files/pi/PiTag";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";

interface Props {
  onGenerateTests?: () => void;
  isGeneratingTests?: boolean;
  canGenerateTests?: boolean;
  response: RQAPI.Response;
  testResults: TestResult[];
  isLoading: boolean;
  isLongRequest?: boolean;
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
  onGenerateTests,
  isGeneratingTests = false,
  canGenerateTests = false,
  response,
  testResults,
  isLoading,
  isFailed,
  isLongRequest,
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

    const isAnyTestFailed = testResults.some((testResult) => testResult.status == "failed");

    return (
      <Tag className={`count test-results-stats ${isAnyTestFailed ? "failed" : "passed"}`}>
        {passedTestsCount} / {testResults.length}
      </Tag>
    );
  }, [testResults]);

  const bottomSheetTabItems = useMemo(() => {
    const baseTabItems = [
      {
        key: BOTTOM_SHEET_TAB_KEYS.RESPONSE,
        icon: MdDataObject,
        label: (
          <span className="tab-items">
            <MdDataObject /> Body
          </span>
        ),
        children: <ResponseBody responseText={response?.body} contentTypeHeader={contentTypeHeader} />,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.HEADERS,
        icon: PiTag,
        label: (
          <span className="tab-items">
            <PiTag />
            Headers {response?.headers?.length ? <Tag className="count">{response?.headers?.length}</Tag> : null}
          </span>
        ),
        children: <ResponseHeaders headers={response?.headers} />,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.TEST_RESULTS,
        icon: MdOutlineScience,
        label: (
          <span className="tab-items">
            <MdOutlineScience />
            Test results {testResultsStats}
          </span>
        ),
        children: (
          <TestsView
            testResults={testResults}
            handleTestResultRefresh={handleTestResultRefresh}
            onGenerateTests={onGenerateTests}
            isGeneratingTests={isGeneratingTests}
            canGenerateTests={canGenerateTests}
          />
        ),
      },
    ];

    if (isLongRequest) {
      return baseTabItems.map((tabItem) => {
        return {
          ...tabItem,
          children: <ApiClientLargeFileLoader onCancelRequest={onCancelRequest} />,
        };
      });
    }

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
    response,
    contentTypeHeader,
    testResultsStats,
    testResults,
    handleTestResultRefresh,
    isLongRequest,
    isLoading,
    isRequestCancelled,
    onCancelRequest,
    error,
    executeRequest,
    onDismissError,
    isFailed,
    canGenerateTests,
    isGeneratingTests,
    onGenerateTests,
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
