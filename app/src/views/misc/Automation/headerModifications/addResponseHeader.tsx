import { useLocation } from "react-router-dom";
import React, { useMemo } from "react";
import { useHeaderModification } from "../utils/headerModificationHandler";
import { AutomationTemplate } from "../components/AutomationTemplate";

export const AddResponseHeader: React.FC = () => {
  const location = useLocation();

  const dataSource = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParamEntries = Array.from(searchParams.entries());
    return queryParamEntries.map(([key, value]) => ({ key, value }));
  }, [location.search]);

  const headers = useMemo(() => {
    return dataSource.map((param) => ({
      header: param.key,
      value: param.value,
    }));
  }, [dataSource]);

  const { isLoading, success, error } = useHeaderModification(headers, "Response", "add");

  return (
    <AutomationTemplate
      title="Add Response Header"
      description={
        <>
          Add your <code>headerName</code> and <code>headerValue</code> in the query parameters to URL. Multiple headers
          can be added by providing multiple query parameters.
        </>
      }
      queryParams={dataSource}
      instructionText="This will create a Header Modification rule and add it to your Requestly extension. To use it, append your headers like this:"
      exampleCode="?<headerName1>=<headerValue1>&<headerName2>=<headerValue2>"
      isLoading={isLoading}
      success={success}
      error={error}
    />
  );
};
