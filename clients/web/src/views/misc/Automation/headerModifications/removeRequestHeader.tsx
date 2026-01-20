import { useLocation } from "react-router-dom";
import React, { useMemo } from "react";
import { useHeaderModification } from "../utils/headerModificationHandler";
import { AutomationTemplate } from "../components/AutomationTemplate";

export const RemoveRequestHeader: React.FC = () => {
  const location = useLocation();
  const dataSource = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParamEntries = Array.from(searchParams.entries());
    return queryParamEntries.map(([key, value]) => ({ key, value }));
  }, [location.search]);

  const headers = useMemo(() => {
    return dataSource.map((param) => ({
      header: param.key,
      value: "",
    }));
  }, [dataSource]);

  const { isLoading, success, error } = useHeaderModification(headers, "Request", "remove");

  return (
    <AutomationTemplate
      title="Remove Request Header"
      description={
        <>
          Add your <code>headerName</code> in the query parameters to URL. Multiple headers can be removed by providing
          multiple query parameters.
        </>
      }
      queryParams={dataSource}
      instructionText="This will create a Header Modification rule and add it to your Requestly extension. To use it, append your headers like this:"
      exampleCode="?<headerName1>&<headerName2>&<headerName3>"
      exampleData={[{ key: "<HEADER_NAME>", value: "NA" }]}
      isLoading={isLoading}
      success={success}
      error={error}
    />
  );
};
