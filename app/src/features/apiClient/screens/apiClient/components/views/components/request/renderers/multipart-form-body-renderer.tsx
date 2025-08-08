import react, { useCallback, useContext } from "react";
import { RequestBodyProps } from "../request-body-types";
import { RQAPI } from "features/apiClient/types";
import { RequestBodyContext, useMultipartFormBody } from "../request-body-state-manager";
import { MultipartFormTable } from "../components/KeyValueTable/MultiPartFormTable";
import { EnvironmentVariables } from "backend/environment/types";

export const MultipartFormBodyRenderer: react.FC<{
  setRequestEntry: RequestBodyProps["setRequestEntry"];
  environmentVariables: EnvironmentVariables;
}> = ({ setRequestEntry, environmentVariables }) => {
  const { requestBodyStateManager } = useContext(RequestBodyContext);
  const { multiPartForm, setMultiPartForm } = useMultipartFormBody(requestBodyStateManager);

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

  return (
    <MultipartFormTable data={multiPartForm} variables={environmentVariables} onChange={handleMultiPartFormChange} />
  );
};
