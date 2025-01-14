import React, { useCallback } from "react";
import { EnvironmentVariables } from "backend/environment/types";
import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { KeyValueTable } from "../../../KeyValueTable/KeyValueTable";

interface HeadersTableProps {
  headers: KeyValuePair[];
  variables: EnvironmentVariables;
  setRequestEntry: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
}

export const HeadersTable: React.FC<HeadersTableProps> = ({ headers, variables, setRequestEntry }) => {
  const handleHeadersChange = useCallback(
    (updatedHeaders: KeyValuePair[]) => {
      setRequestEntry((prev) => ({
        ...prev,
        request: {
          ...prev.request,
          headers: updatedHeaders,
        },
      }));
    },
    [setRequestEntry]
  );

  return <KeyValueTable data={headers} variables={variables} onChange={handleHeadersChange} />;
};
