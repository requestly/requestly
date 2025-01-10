import React from "react";
import { EnvironmentVariables } from "backend/environment/types";
import { KeyValuePair, QueryParamSyncType, RQAPI } from "features/apiClient/types";
import { KeyValueTable } from "../../../KeyValueTable/KeyValueTable";
import { syncQueryParams } from "features/apiClient/screens/apiClient/utils";

interface QueryParamsTableProps {
  requestEntry: RQAPI.Entry;
  variables: EnvironmentVariables;
  setRequestEntry: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
}

export const QueryParamsTable: React.FC<QueryParamsTableProps> = ({ requestEntry, variables, setRequestEntry }) => {
  const handleUpdateQueryParams = (updatedPairs: KeyValuePair[]) => {
    setRequestEntry((prev) => ({
      ...prev,
      request: {
        ...prev.request,
        queryParams: updatedPairs,
        ...syncQueryParams(updatedPairs, requestEntry.request.url, QueryParamSyncType.URL),
      },
    }));
  };

  return (
    <KeyValueTable data={requestEntry.request.queryParams} variables={variables} onChange={handleUpdateQueryParams} />
  );
};
