import React, { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import ResponseHeaders from "../ResponseHeaders/ResponseHeaders";
import { getContentTypeFromResponseHeaders } from "features/apiClient/screens/apiClient/utils";
import ResponseBody from "../ResponseBody/ResponseBody";
import { BottomSheet } from "componentsV2/BottomSheet";
import StatusLine from "../StatusLine";
import { TabsProps, Tag } from "antd";
import { TestsView } from "../TestsView/TestsView";
import { TestStatus } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";
import { ApiClientErrorPanel } from "../../errors/ApiClientErrorPanel/ApiClientErrorPanel";
import { ApiClientLoader } from "../LoadingPlaceholder/ApiClientLoader";
import { EmptyResponsePlaceholder } from "../EmptyResponsePlaceholder/EmptyResponsePlaceholder";
import { AbortError } from "../../errors/AbortError";
import { RequestError } from "../../errors/RequestError";
import { ApiClientWarningPanel } from "../../errors/ApiClientWarningPanel/ApiClientWarningPanel";
import "./apiclientBottomSheet.scss";
import { ApiClientLargeFileLoader } from "../../../../clientView/components/response/LargeFileLoadingPlaceholder";
import { BottomSheetTabLabel } from "componentsV2/BottomSheet/components/BottomSheetLayout/components/BottomSheetTabLabel/BottomSheetTabLabel";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { hasTests } from "features/apiClient/helpers/testGeneration/buildPostResponseTests";

interface Props {
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity;
  onGenerateTests?: () => void;
  isGeneratingTests?: boolean;
  isLoading: boolean;
  isLongRequest?: boolean;
  isFailed: boolean;
  isRequestCancelled: boolean;
  onCancelRequest: () => void;
  handleTestResultRefresh: () => Promise<void>;
  executeRequest: () => Promise<void>;
  onDismissError: () => void;
  error: RQAPI.ExecutionError | null;
  warning: RQAPI.ExecutionWarning | null;
}

const BOTTOM_SHEET_TAB_KEYS = {
  RESPONSE: "RESPONSE",
  HEADERS: "HEADERS",
  TEST_RESULTS: "TEST_RESULTS",
};

export const ApiClientBottomSheet: React.FC<Props> = ({
  entity,
  onGenerateTests,
  isGeneratingTests = false,
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
  const response = useApiClientSelector((s) => entity.getResponse(s));
  const postResponseScript = useApiClientSelector((s) => entity.getPostResponseScript(s));
  const testResults = useApiClientSelector((s) => entity.getTestResults(s));

  const canGenerateTests = useMemo(() => {
    const responseExists = Boolean(postResponseScript);
    if (!responseExists) return false;
    return !hasTests(postResponseScript);
  }, [postResponseScript]);

  const contentTypeHeader = useMemo(() => {
    return response?.headers ? getContentTypeFromResponseHeaders(response.headers) ?? "" : "";
  }, [response?.headers]);

  const testResultsStats = useMemo(() => {
    if (!testResults?.length) return null;

    const passedTestsCount = testResults.filter((testResult) => testResult.status === TestStatus.PASSED).length;

    const isAnyTestFailed = testResults.some((testResult) => testResult.status === "failed");

    return (
      <Tag className={`count test-results-stats ${isAnyTestFailed ? "failed" : "passed"}`}>
        {passedTestsCount} / {testResults.length}
      </Tag>
    );
  }, [testResults]);

  const bottomSheetTabItems = useMemo(() => {
    const baseTabItems: TabsProps["items"] = [
      {
        key: BOTTOM_SHEET_TAB_KEYS.RESPONSE,
        label: (
          <BottomSheetTabLabel label="Body">
            <span className="bottom-sheet-tab">
              <span>Body</span>
            </span>
          </BottomSheetTabLabel>
        ),
        children: <ResponseBody responseText={response?.body} contentTypeHeader={contentTypeHeader} />,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.HEADERS,
        label: (
          <BottomSheetTabLabel label="Headers">
            <span className="bottom-sheet-tab">
              <span>
                Headers {response?.headers?.length ? <Tag className="count">{response?.headers?.length}</Tag> : null}
              </span>
            </span>
          </BottomSheetTabLabel>
        ),
        children: <ResponseHeaders headers={response?.headers} />,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.TEST_RESULTS,
        label: (
          <BottomSheetTabLabel label="Test results">
            <span className="bottom-sheet-tab">
              <span>Tests {testResultsStats}</span>
            </span>
          </BottomSheetTabLabel>
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
          tabBarExtraContent={!isLoading && <StatusLine response={response} entity={entity} />}
        />
      </div>
    </div>
  );
};
