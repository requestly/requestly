import { useCallback, useContext } from "react";
import CodeEditor, { EditorLanguage } from "componentsV2/CodeEditor";
import { EnvironmentVariables } from "backend/environment/types";
import { useDebounce } from "hooks/useDebounce";
import { RequestBodyContext, useTextBody } from "../request-body-state-manager";
import { RequestBodyProps } from "../request-body-types";

export function JsonBody(props: {
  environmentVariables: EnvironmentVariables;
  setRequestEntry: RequestBodyProps["setRequestEntry"];
}) {
  const { environmentVariables, setRequestEntry } = props;

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
    <CodeEditor
      key={"json_body"}
      language={EditorLanguage.JSON}
      defaultValue={text}
      value={text}
      handleChange={handleTextChange}
      prettifyOnInit={true}
      isResizable={false}
      hideCharacterCount
      analyticEventProperties={{ source: "api_client" }}
      envVariables={environmentVariables}
    />
  );
}
