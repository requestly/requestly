import React, { useCallback } from "react";
import { EnvironmentVariables } from "backend/environment/types";
import { KeyValuePair } from "features/apiClient/types";
import { KeyValueTable } from "../../../KeyValueTable/KeyValueTable";
import { useQueryParamStore } from "features/apiClient/hooks/useQueryParamStore";

interface QueryParamsTableProps {
  variables: EnvironmentVariables;
}

export const QueryParamsTable: React.FC<QueryParamsTableProps> = ({ variables }) => {
  const [queryParams, setQueryParams] = useQueryParamStore((state) => [state.queryParams, state.setQueryParams]);

  const handleUpdateQueryParams = useCallback(
    (updatedPairs: KeyValuePair[]) => {
      setQueryParams(updatedPairs);
    },
    [setQueryParams]
  );

  return <KeyValueTable data={queryParams} variables={variables} onChange={handleUpdateQueryParams} />;
};
