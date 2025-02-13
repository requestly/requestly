import React, { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import ResponseHeaders from "../ResponseHeaders/ResponseHeaders";
import { getContentTypeFromResponseHeaders } from "features/apiClient/screens/apiClient/utils";
import ResponseBody from "../ResponseBody/ResponseBody";
import { BottomSheet } from "componentsV2/BottomSheet";
import StatusLine from "../StatusLine";
import { Tag } from "antd";
import { TestsView } from "../TestsView/TestsView";
import { TestResult } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";
import { ApiClientErrorPanel } from "../../errors/ApiClientErrorPanel/ApiClientErrorPanel";
import { ApiClientLoader } from "../LoadingPlaceholder/ApiClientLoader";
import { EmptyResponsePlaceholder } from "../EmptyResponsePlaceholder/EmptyResponsePlaceholder";
import { AbortError } from "../../errors/AbortError";
import { RequestError } from "../../errors/RequestError";
import "./apiclientBottomSheet.scss";

interface Props {
  response: RQAPI.Response;
  testResults: TestResult[];
  isLoading: boolean;
  isFailed: boolean;
  isRequestCancelled: boolean;
  onCancelRequest: () => void;
  handleTestResultRefresh: () => Promise<void>;
  error?: RQAPI.ExecutionError;
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
}) => {
  const contentTypeHeader = useMemo(() => {
    return response?.headers ? getContentTypeFromResponseHeaders(response.headers) : "";
  }, [response?.headers]);

  const bottomSheetTabItems = useMemo(() => {
    const baseTabItems = [
      {
        key: BOTTOM_SHEET_TAB_KEYS.RESPONSE,
        label: "Response body",
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
        label: <>Tests {testResults?.length ? <Tag className="count">{testResults?.length}</Tag> : null}</>,
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

    if (!response) {
      if (isRequestCancelled) {
        return baseTabItems.map((tabItem) => {
          return {
            ...tabItem,
            children: <AbortError error={error} />,
          };
        });
      }

      if (isFailed) {
        return baseTabItems.map((tabItem) => {
          return {
            ...tabItem,
            children: <RequestError error={error} />,
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
    handleTestResultRefresh,
    isFailed,
    isLoading,
    isRequestCancelled,
    onCancelRequest,
    response,
    testResults,
  ]);

  return (
    <div className="api-client-sheet-panel-container">
      {response && error && !isRequestCancelled && <ApiClientErrorPanel error={error} />}
      <div className="api-client-sheet-panel">
        <BottomSheet
          items={bottomSheetTabItems}
          disableDocking
          tabBarExtraContent={<StatusLine response={response} />}
        />
      </div>
    </div>
  );
};
