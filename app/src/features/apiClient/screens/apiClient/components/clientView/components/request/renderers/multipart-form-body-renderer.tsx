import react, { useCallback, useContext } from "react";
import { RequestBodyProps } from "../request-body-types";
import { RQAPI } from "features/apiClient/types";
import { RequestBodyContext, useMultiPartFormBody } from "../request-body-state-manager";
import { MultiPartFormTable } from "../components/KeyValueTable/MultiPartFormTable";
import { EnvironmentVariables } from "backend/environment/types";

export const MultipartFormBodyRenderer: react.FC<{
  setRequestEntry: RequestBodyProps["setRequestEntry"];
  environmentVariables: EnvironmentVariables;
}> = ({ setRequestEntry, environmentVariables }) => {
  const { requestBodyStateManager } = useContext(RequestBodyContext);
  const { multiPartForm, setMultiPartForm } = useMultiPartFormBody(requestBodyStateManager);

  const handleMultiPartFormChange = useCallback(
    (updatedPairs: RQAPI.FormDataKeyValuePair[]) => {
      console.log("updated pairs", updatedPairs);
      setRequestEntry((prev) => {
        setMultiPartForm(updatedPairs);
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
    <MultiPartFormTable data={multiPartForm} variables={environmentVariables} onChange={handleMultiPartFormChange} />
  );
};
