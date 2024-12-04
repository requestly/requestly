import React, { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import ResponseHeaders from "../ResponseHeaders/ResponseHeaders";
import { getContentTypeFromResponseHeaders } from "features/apiClient/screens/apiClient/utils";
import ResponseBody from "../ResponseBody/ResponseBody";
import { BottomSheet } from "componentsV2/BottomSheet";
import StatusLine from "../StatusLine";

interface Props {
  response: RQAPI.Response;
  isLoading: boolean;
  isFailed: boolean;
  isRequestCancelled: boolean;
  onCancelRequest: () => void;
  errorMessage?: string;
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
  errorMessage,
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
            errorMessage={errorMessage}
          />
        ),
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.HEADERS,
        label: "Headers",
        children: (
          <ResponseHeaders
            headers={response?.headers}
            isLoading={isLoading}
            isFailed={isFailed}
            onCancelRequest={onCancelRequest}
            errorMessage={errorMessage}
          />
        ),
      },
    ];
  }, [response?.body, response?.headers, contentTypeHeader, isLoading, isFailed, onCancelRequest, errorMessage]);

  return <BottomSheet items={bottomSheetTabItems} disableDocking utilities={<StatusLine response={response} />} />;
};
