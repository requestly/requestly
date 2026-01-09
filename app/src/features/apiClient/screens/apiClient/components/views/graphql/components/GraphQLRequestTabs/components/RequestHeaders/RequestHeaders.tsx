import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { HeadersTable } from "../../../../../components/request/components/HeadersTable/HeadersTable";
import { KeyValuePair, RQAPI } from "features/apiClient/types";
import React from "react";

interface Props {
  requestId: RQAPI.ApiRecord["id"];
}

export const RequestHeaders: React.FC<Props> = ({ requestId }) => {
  const [headers, updateEntryRequest] = useGraphQLRecordStore((state) => [
    state.entry.request.headers,
    state.updateEntryRequest,
  ]);

  const handleHeadersChange = (newHeaders: KeyValuePair[]) => {
    updateEntryRequest({
      headers: newHeaders,
    });
  };
  return <HeadersTable headers={headers} recordId={requestId} onHeadersChange={handleHeadersChange} />;
};
