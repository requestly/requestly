import React, { useCallback } from "react";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { useDebounce } from "hooks/useDebounce";
import Editor from "componentsV2/CodeEditor";
import { RequestContentType } from "features/apiClient/types";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { RQAPI } from "@requestly/shared/types/entities/apiClient";

export function RawBody(props: {
  handleContentChange: (contentType: RequestContentType, body: RQAPI.RequestBody) => void;
  contentType: RequestContentType;
  recordId: string;
  editorOptions: React.ReactNode;
  body?: string;
}) {
  const { recordId, editorOptions, contentType, handleContentChange, body = "" } = props;

  const scopedVariables = useScopedVariables(recordId);

  const handleTextChange = useDebounce(
    useCallback(
      (value: string) => {
        handleContentChange(contentType, value);
      },
      [handleContentChange, contentType]
    ),
    500,
    { leading: true, trailing: true }
  );

  const editorLanguage = contentType === "application/json" ? EditorLanguage.JSON : null;

  return (
    <div className="api-client-code-editor-container api-request-body-editor-container">
      <Editor
        language={editorLanguage}
        value={body}
        handleChange={handleTextChange}
        prettifyOnInit={false}
        isResizable={false}
        hideCharacterCount
        envVariables={scopedVariables}
        toolbarOptions={{ title: "", options: [editorOptions] }}
        analyticEventProperties={{ source: "api_client" }}
        showOptions={{
          enablePrettify: contentType === "application/json",
        }}
      />
    </div>
  );
}
