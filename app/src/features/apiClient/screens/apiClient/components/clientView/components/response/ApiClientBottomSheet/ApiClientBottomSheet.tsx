import React, { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import ResponseHeaders from "../ResponseHeaders/ResponseHeaders";
import { getContentTypeFromResponseHeaders } from "features/apiClient/screens/apiClient/utils";
import ResponseBody from "../ResponseBody/ResponseBody";
import { BottomSheet } from "componentsV2/BottomSheet";
import StatusLine from "../StatusLine";
import { Tag } from "antd";

interface Props {
  response: RQAPI.Response;
  isLoading: boolean;
  isFailed: boolean;
  isRequestCancelled: boolean;
  onCancelRequest: () => void;
  error?: RQAPI.RequestErrorEntry["error"];
}

const BOTTOM_SHEET_TAB_KEYS = {
  RESPONSE: "RESPONSE",
  HEADERS: "HEADERS",
};

export const ApiClientBottomSheet: React.FC<Props> = ({
  response,
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
    ];
  }, [response?.body, response?.headers, contentTypeHeader, isLoading, isFailed, onCancelRequest, error]);

  return <BottomSheet items={bottomSheetTabItems} disableDocking utilities={<StatusLine response={response} />} />;
};
