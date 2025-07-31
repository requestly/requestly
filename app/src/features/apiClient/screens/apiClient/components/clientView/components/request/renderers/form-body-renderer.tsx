import { KeyValuePair } from "features/apiClient/types";
import { useCallback, useContext } from "react";
import { RequestBodyContext, useFormBody } from "../request-body-state-manager";
import { RequestBodyProps } from "../request-body-types";
import { KeyValueTable } from "../components/KeyValueTable/KeyValueTable";
import { useApiRecordState } from "features/apiClient/hooks/useApiRecordState.hook";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

export function FormBody(props: { recordId: string; setRequestEntry: RequestBodyProps["setRequestEntry"] }) {
  const { recordId, setRequestEntry } = props;

  const { requestBodyStateManager } = useContext(RequestBodyContext);
  const { formBody, setFormBody } = useFormBody(requestBodyStateManager);

  const { version } = useApiRecordState(recordId);
  const scopedVariables = useScopedVariables(recordId, version);

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

  return <KeyValueTable data={formBody} variables={scopedVariables} onChange={handleFormChange} />;
}
