import React, { useCallback, useMemo, useState } from "react";
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
  console.log(body, contentType);
  const [rawBody, setRawBody] = useState(RequestContentType.RAW === contentType ? body : "");
  const [jsonBody, setJsonBody] = useState(RequestContentType.JSON === contentType ? body : "");
  const [formBody, setFormBody] = useState(RequestContentType.FORM === contentType ? body : []);

  const handleRawChange = useCallback(
    (value: string) => {
      setRawBody(value);
      setRequestEntry((prev) => ({ ...prev, request: { ...prev.request, body: value } }));
    },
    [setRequestEntry]
  );

  const handleJsonChange = useCallback(
    (value: string) => {
      setJsonBody(value);
      //const parsedValue = JSON.parse(value);
      setRequestEntry((prev) => ({ ...prev, request: { ...prev.request, body: value } }));
    },
    [setRequestEntry]
  );
  //since setKeyValuePairs requires a updater fn, which requires entry object & returns the updated object
  //wrapping this with updated fn
  const handleFormChange = useCallback(
    (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => {
      setRequestEntry((prevEntry) => {
        const updatedEntry = updaterFn(prevEntry);
        setFormBody(updatedEntry.request.body as KeyValuePair[]);
        return updatedEntry;
      });
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
            value={jsonBody as string}
            handleChange={handleJsonChange}
            isResizable={false}
            hideCharacterCount
            analyticEventProperties={{ source: "api_client" }}
          />
        );

      case RequestContentType.FORM:
        return (
          <KeyValueTable
            pairType={KeyValueFormType.FORM}
            data={formBody as KeyValuePair[]}
            setKeyValuePairs={handleFormChange}
            variables={variables}
          />
        );

      default:
        return (
          <Input.TextArea
            className="api-request-body-raw"
            placeholder="Enter text here..."
            value={rawBody as string}
            onChange={(e) => handleRawChange(e.target.value)}
          />
        );
    }
  }, [
    rawBody,
    formBody,
    jsonBody,
    contentType,
    setRequestEntry,
    handleRawChange,
    handleFormChange,
    handleJsonChange,
    variables,
  ]);

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
