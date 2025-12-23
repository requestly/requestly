import react, { useCallback } from "react";
import { RQAPI } from "features/apiClient/types";
import { MultipartFormTable } from "../components/KeyValueTable/MultiPartFormTable";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { RequestContentType } from "@requestly/shared/types/entities/apiClient";

export const MultipartFormBodyRenderer: react.FC<{
  recordId: string;
  contentType: RequestContentType;
  handleContentChange: (contentType: RequestContentType, body: RQAPI.RequestBody) => void;
  body?: RQAPI.FormDataKeyValuePair[];
}> = ({ recordId, contentType, handleContentChange, body = [] }) => {
  const scopedVariables = useScopedVariables(recordId);

  const handleMultiPartFormChange = useCallback(
    (updatedPairs: RQAPI.FormDataKeyValuePair[]) => {
      handleContentChange(contentType, updatedPairs);
    },
    [handleContentChange, contentType]
  );

  return <MultipartFormTable data={body} variables={scopedVariables} onChange={handleMultiPartFormChange} />;
};
