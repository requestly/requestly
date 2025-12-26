import { KeyValuePair } from "features/apiClient/types";
import { useCallback } from "react";
import { KeyValueTable } from "../components/KeyValueTable/KeyValueTable";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { RequestContentType, RQAPI } from "@requestly/shared/types/entities/apiClient";

export function FormBody(props: {
  recordId: string;
  contentType: RequestContentType;
  handleContentChange: (contentType: RequestContentType, body: RQAPI.RequestBody) => void;
  body?: KeyValuePair[];
}) {
  const { recordId, contentType, handleContentChange, body = [] } = props;

  const scopedVariables = useScopedVariables(recordId);

  const handleFormChange = useCallback(
    (updatedPairs: KeyValuePair[]) => {
      handleContentChange(contentType, updatedPairs);
    },
    [handleContentChange, contentType]
  );

  const extraTableColumns = {
    description: {
      visible: false,
      onToggle: () => {},
    },
    dataType: { visible: false },
  };
  return (
    <KeyValueTable
      data={body}
      variables={scopedVariables}
      onChange={handleFormChange}
      extraColumns={extraTableColumns}
    />
  );
}
