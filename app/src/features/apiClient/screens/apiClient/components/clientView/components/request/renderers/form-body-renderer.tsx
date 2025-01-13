import { EnvironmentVariables } from "backend/environment/types";
import { KeyValueFormType, KeyValuePair, RQAPI } from "features/apiClient/types";
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
    (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => {
      setRequestEntry((prev) => {
        const updatedEntry = updaterFn(prev);
        setFormBody(updatedEntry.request.body as KeyValuePair[]);
        return {
          ...prev,
          request: {
            ...prev.request,
            body: updatedEntry.request.body,
            bodyContainer: requestBodyStateManager.serialize(),
          },
        };
      });
    },
    [setRequestEntry, setFormBody, requestBodyStateManager]
  );

  return (
    <KeyValueTable
      pairType={KeyValueFormType.FORM}
      data={formBody}
      setKeyValuePairs={handleFormChange}
      variables={environmentVariables}
    />
  );
}
