import React, { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import ResponseHeaders from "../ResponseHeaders/ResponseHeaders";
import { getContentTypeFromResponseHeaders } from "features/apiClient/screens/apiClient/utils";
import ResponseBody from "../ResponseBody/ResponseBody";
import { BottomSheet } from "componentsV2/BottomSheet";
import StatusLine from "../StatusLine";
import { Tag } from "antd";
import { TestsView } from "../TestsView/TestsView";

interface Props {
  response: RQAPI.Response;
  testResults: RQAPI.TestResult[];
  isLoading: boolean;
  isFailed: boolean;
  isRequestCancelled: boolean;
  onCancelRequest: () => void;
  error?: RQAPI.RequestErrorEntry["error"];
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
  onCancelRequest,
  error,
}) => {
  const contentTypeHeader = useMemo(() => {
    return response?.headers ? getContentTypeFromResponseHeaders(response.headers) : "";
  }, [response?.headers]);

  const bottomSheetTabItems = useMemo(() => {
    return [
      {
        key: BOTTOM_SHEET_TAB_KEYS.RESPONSE,
        label: "Response body",
        children: (
          <ResponseBody
            responseText={response?.body}
            contentTypeHeader={contentTypeHeader}
            isLoading={isLoading}
            isFailed={isFailed}
            onCancelRequest={onCancelRequest}
            error={error}
          />
        ),
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.HEADERS,
        label: (
          <>Headers {response?.headers?.length ? <Tag className="count">{response?.headers?.length}</Tag> : null}</>
        ),
        children: (
          <ResponseHeaders
            headers={response?.headers}
            isLoading={isLoading}
            isFailed={isFailed}
            onCancelRequest={onCancelRequest}
            error={error}
          />
        ),
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.TEST_RESULTS,
        label: <>Tests {testResults?.length ? <Tag className="count">{testResults?.length}</Tag> : null}</>,
        children: <TestsView testResults={testResults} isLoading={isLoading} onCancelRequest={onCancelRequest} />,
      },
    ];
  }, [response?.body, response?.headers, contentTypeHeader, isLoading, isFailed, onCancelRequest, error, testResults]);

  return <BottomSheet items={bottomSheetTabItems} disableDocking utilities={<StatusLine response={response} />} />;
};
