import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { HeadersTable } from "../../../../../components/request/components/HeadersTable/HeadersTable";
import { KeyValuePair, RQAPI } from "features/apiClient/types";
import React from "react";

interface Props {
  requestId: RQAPI.ApiRecord["id"];
}

export const RequestHeaders: React.FC<Props> = ({ requestId }) => {
  const [headers, updateRecordRequest] = useGraphQLRecordStore((state) => [
    state.record.data.request.headers,
    state.updateRecordRequest,
  ]);

  const handleHeadersChange = (newHeaders: KeyValuePair[]) => {
    updateRecordRequest({
      headers: newHeaders,
    });
  };
  return (
    <div className="graphql-request-tab-content">
      <HeadersTable headers={headers} recordId={requestId} onHeadersChange={handleHeadersChange} />
    </div>
  );
};
