import React, { useCallback } from "react";
import { EnvironmentVariables } from "backend/environment/types";
import { KeyValuePair } from "features/apiClient/types";
import { KeyValueTable } from "../../../KeyValueTable/KeyValueTable";
import { useQueryParamStore } from "features/apiClient/hooks/useQueryParamStore";
import { useGenericState } from "hooks/useGenericState";

interface QueryParamsTableProps {
  variables: EnvironmentVariables;
}

export const QueryParamsTable: React.FC<QueryParamsTableProps> = ({ variables }) => {
  const { setUnsaved } = useGenericState();

  const [queryParams, setQueryParams] = useQueryParamStore((state) => [state.queryParams, state.setQueryParams]);

  const handleUpdateQueryParams = useCallback(
    (updatedPairs: KeyValuePair[]) => {
      setQueryParams(updatedPairs);
      setUnsaved(true);
    },
    [setQueryParams, setUnsaved]
  );

  return <KeyValueTable data={queryParams} variables={variables} onChange={handleUpdateQueryParams} />;
};
