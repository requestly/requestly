import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { HeadersTable } from "../../../../../components/request/components/HeadersTable/HeadersTable";
import { KeyValuePair } from "features/apiClient/types";
import { EnvironmentVariables } from "backend/environment/types";
import React from "react";

interface Props {
  variables: EnvironmentVariables;
}

export const RequestHeaders: React.FC<Props> = ({ variables }) => {
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
      <HeadersTable headers={headers} variables={variables} onHeadersChange={handleHeadersChange} />
    </div>
  );
};
