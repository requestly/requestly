import React, { useCallback, useRef } from "react";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { useDebounce } from "hooks/useDebounce";
import Editor from "componentsV2/CodeEditor";
import { RequestContentType } from "features/apiClient/types";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { RQAPI } from "@requestly/shared/types/entities/apiClient";
import { VariableAutocompletePopover } from "features/apiClient/screens/environment/components/VariableAutocompletePopover/VariableAutocompletePopover";
import { useVariableAutocomplete } from "features/apiClient/screens/environment/components/hooks/useVariableAutocomplete";

export function RawBody(props: {
  handleContentChange: (contentType: RequestContentType, body: RQAPI.RequestBody) => void;
  contentType: RequestContentType;
  recordId: string;
  editorOptions: React.ReactNode;
  body?: string;
}) {
  const { recordId, editorOptions, contentType, handleContentChange, body = "" } = props;

  const scopedVariables = useScopedVariables(recordId);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const {
    autocompleteState,
    autocompleteExtension,
    handleEditorReady,
    handleSelectVariable,
    handleCloseAutocomplete,
  } = useVariableAutocomplete(scopedVariables);

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

  let editorLanguage;
  switch (contentType) {
    case RequestContentType.JSON:
      editorLanguage = EditorLanguage.JSON5;
      break;
    case RequestContentType.XML:
      editorLanguage = EditorLanguage.XML;
      break;
  }

  return (
    <>
      <div ref={editorContainerRef} className="api-client-code-editor-container api-request-body-editor-container">
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
            enablePrettify: contentType === RequestContentType.JSON || contentType === RequestContentType.XML,
          }}
          disableDefaultAutoCompletions={true}
          customTheme={autocompleteExtension}
          onEditorReady={handleEditorReady}
          onBlur={handleCloseAutocomplete}
        />
      </div>

      <VariableAutocompletePopover
        show={autocompleteState.show}
        position={autocompleteState.position}
        search={autocompleteState.filter}
        variables={scopedVariables}
        onSelect={handleSelectVariable}
        onClose={handleCloseAutocomplete}
      />
    </>
  );
}
