import React, { useCallback, useContext } from "react";
import Editor from "componentsV2/CodeEditor/components/EditorV2/Editor";
import { EnvironmentVariables } from "backend/environment/types";
import { useDebounce } from "hooks/useDebounce";
import { RequestBodyContext, useTextBody } from "../request-body-state-manager";
import { RequestBodyProps } from "../request-body-types";

export function RawBody(props: {
  environmentVariables: EnvironmentVariables;
  setRequestEntry: RequestBodyProps["setRequestEntry"];
  editorOptions: React.ReactNode;
}) {
  const { environmentVariables, setRequestEntry, editorOptions } = props;

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

  return (
    <div className="api-client-code-editor-container api-request-body-editor-container">
      <Editor
        key={"raw_body"}
        language={null}
        value={text}
        handleChange={handleTextChange}
        isResizable={false}
        hideCharacterCount
        analyticEventProperties={{ source: "api_client" }}
        envVariables={environmentVariables}
        showOptions={{
          enablePrettify: false,
        }}
        toolbarOptions={{ title: "", options: [editorOptions] }}
      />
    </div>
  );
}
