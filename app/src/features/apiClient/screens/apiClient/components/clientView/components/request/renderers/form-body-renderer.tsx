import { EnvironmentVariables } from "backend/environment/types";
import { KeyValuePair } from "features/apiClient/types";
import { useCallback, useContext } from "react";
import { RequestBodyContext, useFormBody } from "../request-body-state-manager";
import { RequestBodyProps } from "../request-body-types";
import { KeyValueTable } from "../components/KeyValueTable/KeyValueTable";

export function FormBody(props: {
  environmentVariables: EnvironmentVariables;
  setRequestEntry: RequestBodyProps["setRequestEntry"];
}) {
  const { environmentVariables, setRequestEntry } = props;

  const { requestBodyStateManager } = useContext(RequestBodyContext);
  const { formBody, setFormBody } = useFormBody(requestBodyStateManager);

  const handleFormChange = useCallback(
    (updatedPairs: KeyValuePair[]) => {
      setRequestEntry((prev) => {
        setFormBody(updatedPairs);
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
    [setRequestEntry, setFormBody, requestBodyStateManager]
  );

  return <KeyValueTable data={formBody} variables={environmentVariables} onChange={handleFormChange} />;
}
