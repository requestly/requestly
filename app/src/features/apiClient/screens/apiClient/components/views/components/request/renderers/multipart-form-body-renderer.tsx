import react, { useCallback, useContext } from "react";
import { RequestBodyProps } from "../request-body-types";
import { RQAPI } from "features/apiClient/types";
import { RequestBodyContext, useMultipartFormBody } from "../request-body-state-manager";
import { MultipartFormTable } from "../components/KeyValueTable/MultiPartFormTable";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

export const MultipartFormBodyRenderer: react.FC<{
  recordId: string;
  setRequestEntry: RequestBodyProps["setRequestEntry"];
}> = ({ recordId, setRequestEntry }) => {
  const { requestBodyStateManager } = useContext(RequestBodyContext);
  const { multiPartForm, setMultiPartForm } = useMultipartFormBody(requestBodyStateManager);
  const scopedVariables = useScopedVariables(recordId);

  const handleMultiPartFormChange = useCallback(
    (updatedPairs: RQAPI.FormDataKeyValuePair[]) => {
      setMultiPartForm(updatedPairs);
      setRequestEntry((prev) => {
        return {
          ...prev,
          request: {
            ...prev.request,
            body: updatedPairs,
            bodyContainer: requestBodyStateManager.serialize(),
          },
        };
      });
    },
    [requestBodyStateManager, setMultiPartForm, setRequestEntry]
  );

  return <MultipartFormTable data={multiPartForm} variables={scopedVariables} onChange={handleMultiPartFormChange} />;
};
