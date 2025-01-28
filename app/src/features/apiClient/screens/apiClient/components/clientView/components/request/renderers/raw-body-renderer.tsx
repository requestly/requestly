import React, { useCallback, useContext } from "react";
// import CodeEditor, { EditorLanguage } from "componentsV2/CodeEditor";
import Editor from "componentsV2/CodeEditor/components/EditorV2/Editor";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { EnvironmentVariables } from "backend/environment/types";
import { useDebounce } from "hooks/useDebounce";
import { RequestBodyContext, useTextBody } from "../request-body-state-manager";
import { RequestBodyProps } from "../request-body-types";

export function RawBody(props: {
  contentType: "text/plain" | "application/json";
  environmentVariables: EnvironmentVariables;
  setRequestEntry: RequestBodyProps["setRequestEntry"];
  editorOptions: React.ReactNode;
  isFullScreen: boolean;
  onFullscreenChange: () => void;
}) {
  const { environmentVariables, setRequestEntry, editorOptions, contentType, isFullScreen, onFullscreenChange } = props;

  const { requestBodyStateManager } = useContext(RequestBodyContext);
  const { text, setText } = useTextBody(requestBodyStateManager);

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
        // key={`${contentType}_body`}
        language={editorLanguage}
        value={text}
        handleChange={handleTextChange}
        prettifyOnInit={contentType === "application/json"}
        isResizable={false}
        hideCharacterCount
        envVariables={environmentVariables}
        toolbarOptions={{ title: "", options: [editorOptions] }}
        isFullScreen={isFullScreen}
        onFullscreenChange={onFullscreenChange}
        analyticEventProperties={{ source: "api_client" }}
        showOptions={{
          enablePrettify: contentType === "application/json",
        }}
      />
    </div>
  );
}
