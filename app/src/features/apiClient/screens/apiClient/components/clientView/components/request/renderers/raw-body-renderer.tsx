import React, { useCallback, useContext } from "react";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { EnvironmentVariables } from "backend/environment/types";
import { useDebounce } from "hooks/useDebounce";
import { RequestBodyContext, useTextBody } from "../request-body-state-manager";
import { RequestBodyProps } from "../request-body-types";
import Editor from "componentsV2/CodeEditor";
import { RequestContentType } from "features/apiClient/types";
import { useApiRecordState } from "features/apiClient/hooks/useApiRecordState.hook";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

export function RawBody(props: {
  contentType: RequestContentType;
  recordId: string;
  setRequestEntry: RequestBodyProps["setRequestEntry"];
  editorOptions: React.ReactNode;
}) {
  const { recordId, setRequestEntry, editorOptions, contentType } = props;

  const { requestBodyStateManager } = useContext(RequestBodyContext);
  const { text, setText } = useTextBody(requestBodyStateManager);

  const { version } = useApiRecordState(recordId);
  const scopedVariables = useScopedVariables(recordId, version);

  const handleTextChange = useDebounce(
    useCallback(
      (value: string) => {
        setText(value);
        setRequestEntry((prev) => ({
          ...prev,
          request: { ...prev.request, body: value, bodyContainer: requestBodyStateManager.serialize() },
        }));
      },
      [setRequestEntry, setText, requestBodyStateManager]
    ),
    500,
    { leading: true, trailing: true }
  );

  const editorLanguage = contentType === "application/json" ? EditorLanguage.JSON : null;

  return (
    <div className="api-client-code-editor-container api-request-body-editor-container">
      <Editor
        language={editorLanguage}
        value={text ?? ""}
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
