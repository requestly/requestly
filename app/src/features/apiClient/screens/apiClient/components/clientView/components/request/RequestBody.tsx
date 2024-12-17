import React, { useCallback, useMemo } from "react";
import { Input, Radio } from "antd";
import { KeyValueFormType, KeyValuePair, RQAPI, RequestContentType } from "../../../../../../types";
import CodeEditor, { EditorLanguage } from "componentsV2/CodeEditor";
import { KeyValueTable } from "./components/KeyValueTable/KeyValueTable";
import { EnvironmentVariables } from "backend/environment/types";

interface Props {
  body: RQAPI.RequestBody;
  contentType: RequestContentType;
  variables: EnvironmentVariables;
  setRequestEntry: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
  setContentType: (contentType: RequestContentType) => void;
}

const RequestBody: React.FC<Props> = ({ body, contentType, variables, setRequestEntry, setContentType }) => {
  const handleBodyChange = useCallback(
    (body: string) => {
      setRequestEntry((prev) => ({ ...prev, request: { ...prev.request, body } }));
    },
    [setRequestEntry]
  );

  const bodyEditor = useMemo(() => {
    switch (contentType) {
      case RequestContentType.JSON:
        return (
          // @ts-ignore
          <CodeEditor
            language={EditorLanguage.JSON}
            value={body as string}
            handleChange={handleBodyChange}
            defaultPrettified={true}
            isResizable={false}
            hideCharacterCount
            analyticEventProperties={{ source: "api_client" }}
          />
        );

      case RequestContentType.FORM:
        return (
          <KeyValueTable
            pairType={KeyValueFormType.FORM}
            data={body as KeyValuePair[]}
            setKeyValuePairs={setRequestEntry}
            variables={variables}
          />
        );

      default:
        return (
          <Input.TextArea
            className="api-request-body-raw"
            placeholder="Enter text here..."
            value={body as string}
            onChange={(e) => handleBodyChange(e.target.value)}
          />
        );
    }
  }, [body, contentType, setRequestEntry, handleBodyChange, variables]);

  return (
    <div className="api-request-body">
      <div className="api-request-body-options">
        <Radio.Group
          onChange={(e) => setContentType(e.target.value)}
          defaultValue={RequestContentType.RAW}
          value={contentType}
        >
          <Radio value={RequestContentType.RAW}>Raw</Radio>
          <Radio value={RequestContentType.JSON}>JSON</Radio>
          <Radio value={RequestContentType.FORM}>Form</Radio>
        </Radio.Group>
      </div>
      {bodyEditor}
    </div>
  );
};

export default RequestBody;
